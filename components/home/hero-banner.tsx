'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerSlide {
  id: number;
  image: string;
  alt: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: '/images/banner-1.jpg',
    alt: 'Premium Collection Banner',
  },
  {
    id: 2,
    image: '/images/banner-2.jpg',
    alt: 'Summer Sale Banner',
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full" style={{ aspectRatio: '16/6' }}>
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-contain"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {bannerSlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background/90 hover:opacity-100 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background/90 hover:opacity-100 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'bg-background/60 hover:bg-background/80'
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