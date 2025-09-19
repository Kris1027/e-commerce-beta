'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn, ImageIcon } from 'lucide-react';


interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

// Custom skeleton component with shimmer effect
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm", className)}>
      {/* Shimmer effect layers */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 -translate-x-full animate-shimmer-delayed bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

      {/* Center content with glass effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />

          {/* Icon container with glass morphism */}
          <div className="relative rounded-2xl bg-background/10 backdrop-blur-md border border-white/10 p-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
          </div>
        </div>
      </div>

      {/* Subtle animated gradient overlay */}
      <div
        className="absolute inset-0 animate-pulse-subtle"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)'
        }}
      />
    </div>
  );
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Initialize loading state for first image
  useEffect(() => {
    if (images && images.length > 0) {
      setIsLoading(true);
    }
  }, [images]);

  // Preload adjacent images using browser's native preloading
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const preloadImages = () => {
      // Preload next image
      const nextIndex = (selectedImage + 1) % images.length;
      const nextImage = images[nextIndex];
      if (nextImage && !loadedImages.has(nextIndex)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = nextImage;
        document.head.appendChild(link);
      }

      // Preload previous image
      const prevIndex = selectedImage === 0 ? images.length - 1 : selectedImage - 1;
      const prevImage = images[prevIndex];
      if (prevImage && !loadedImages.has(prevIndex)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = prevImage;
        document.head.appendChild(link);
      }
    };

    preloadImages();
  }, [selectedImage, images, loadedImages]);

  // Stable callback that doesn't depend on selectedImage
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => {
      // Only create a new Set if the index isn't already in it
      if (!prev.has(index)) {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      }
      return prev;
    });
  }, []);

  // Update loading state when selectedImage changes or images load
  useEffect(() => {
    if (loadedImages.has(selectedImage)) {
      setIsLoading(false);
    }
  }, [selectedImage, loadedImages]);

  const handleImageChange = useCallback((newIndex: number) => {
    if (newIndex === selectedImage) return;

    // Set loading state for the new image if it hasn't been loaded yet
    if (!loadedImages.has(newIndex)) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    setSelectedImage(newIndex);
  }, [selectedImage, loadedImages]);

  const handlePrevious = useCallback(() => {
    const newIndex = selectedImage === 0 ? images.length - 1 : selectedImage - 1;
    handleImageChange(newIndex);
  }, [selectedImage, images.length, handleImageChange]);

  const handleNext = useCallback(() => {
    const newIndex = selectedImage === images.length - 1 ? 0 : selectedImage + 1;
    handleImageChange(newIndex);
  }, [selectedImage, images.length, handleImageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
        {/* Skeleton always visible as base layer */}
        <ImageSkeleton className="absolute inset-0 h-full w-full rounded-lg" />

        {/* Main Image - only visible when loaded */}
        <div className={cn(
          "absolute inset-0 bg-background transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}>
          <Image
            key={`main-${selectedImage}`}
            src={images[selectedImage] || '/placeholder.svg'}
            alt={`${productName} - Image ${selectedImage + 1}`}
            fill
            className="object-cover"
            priority={true}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            onLoad={() => handleImageLoad(selectedImage)}
          />
        </div>

        {/* Zoom indicator on hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-2">
            <ZoomIn className="h-4 w-4" />
          </div>
        </div>

        {/* Navigation Arrows with Better Visibility */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-all hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images with Loading States */}
      {images.length > 1 && (
        <div className="relative">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => handleImageChange(index)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md bg-muted border-2 transition-all cursor-pointer group',
                  selectedImage === index
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-transparent hover:border-muted-foreground/50 hover:scale-105'
                )}
              >
                {/* Thumbnail Loading Skeleton */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 z-10">
                    <ImageSkeleton className="h-full w-full rounded-md" />
                  </div>
                )}

                <Image
                  src={image}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-all duration-300",
                    !loadedImages.has(index) ? "opacity-0" : "opacity-100",
                    selectedImage === index && "brightness-110"
                  )}
                  sizes="(max-width: 768px) 25vw, 10vw"
                  quality={75}
                  onLoad={() => handleImageLoad(index)}
                  loading="lazy"
                />

                {/* Selection Indicator Overlay */}
                {selectedImage === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            ))}
          </div>

          {/* Thumbnail Navigation Dots for Mobile */}
          <div className="flex justify-center gap-1 mt-3 sm:hidden">
            {images.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => handleImageChange(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  selectedImage === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}