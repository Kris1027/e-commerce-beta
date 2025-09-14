'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BannerSlide {
  id: number;
  image: string;
  mobileImage?: string;
  alt: string;
  promoLink: string; // URL where the banner should link to
}

// Simple configuration - just add image path and promo URL
const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: '/images/banner-1.jpg',
    alt: 'Current Promotion 1',
    promoLink: '/products', // Change this to your promo URL
  },
  {
    id: 2,
    image: '/images/banner-2.jpg',
    alt: 'Current Promotion 2',
    promoLink: '/products', // Change this to your promo URL
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    goToSlide(
      currentSlide === 0 ? bannerSlides.length - 1 : currentSlide - 1
    );
  };

  const goToNext = () => {
    goToSlide((currentSlide + 1) % bannerSlides.length);
  };

  const handleImageError = (slideId: number) => {
    setImageLoadError(prev => ({ ...prev, [slideId]: true }));
  };

  return (
    <div className="relative w-full overflow-hidden bg-muted group">
      {/* Mobile: 4:3 aspect ratio, Desktop: 16:6 aspect ratio */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/6]">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Clickable Banner Link */}
            <Link
              href={slide.promoLink}
              className="absolute inset-0 z-10"
              aria-label={slide.alt}
            >
              <span className="sr-only">Go to {slide.alt}</span>
            </Link>

            {/* Image with error handling */}
            {!imageLoadError[slide.id] ? (
              <>
                {/* Desktop Image */}
                <div className="hidden sm:block absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                    onError={() => handleImageError(slide.id)}
                  />
                </div>

                {/* Mobile Image or Fallback */}
                <div className="sm:hidden absolute inset-0">
                  <Image
                    src={slide.mobileImage || slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                    onError={() => handleImageError(slide.id)}
                  />
                </div>
              </>
            ) : (
              /* Fallback gradient background when image fails to load */
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
          </div>
        ))}
      </div>

      {bannerSlides.length > 1 && (
        <>
          {/* Navigation Arrows - Hidden by default, visible on desktop hover only */}
          <Button
            onClick={goToPrevious}
            variant="ghost"
            size="icon"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 backdrop-blur text-white opacity-0 transition-all duration-300 hover:bg-black/40 hover:scale-110 group-hover:opacity-100 cursor-pointer items-center justify-center z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={goToNext}
            variant="ghost"
            size="icon"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 backdrop-blur text-white opacity-0 transition-all duration-300 hover:bg-black/40 hover:scale-110 group-hover:opacity-100 cursor-pointer items-center justify-center z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots Indicator - Using Button for better accessibility */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2 z-20">
            {bannerSlides.map((slide, index) => (
              <Button
                key={slide.id}
                onClick={() => goToSlide(index)}
                variant="ghost"
                className={cn(
                  'h-1.5 sm:h-2 p-0 rounded-full transition-all cursor-pointer',
                  index === currentSlide
                    ? 'w-6 sm:w-8 bg-white hover:bg-white'
                    : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white/80'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}