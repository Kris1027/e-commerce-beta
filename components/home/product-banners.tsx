'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Pause, Play } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ProductBanner {
  id: string;
  name: string;
  slug: string;
  banner: string;
  price: string;
  category: string;
}

interface ProductBannersClientProps {
  bannerProducts: ProductBanner[];
}

export function ProductBannersClient({ bannerProducts }: ProductBannersClientProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true
    })
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const toggleAutoplay = React.useCallback(() => {
    const plugin = autoplayPlugin.current;
    if (isPlaying) {
      plugin.stop();
    } else {
      plugin.reset();
      plugin.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  if (!bannerProducts || bannerProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full group">
      {/* Accessibility: Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {current > 0 && `Slide ${current} of ${count}: ${bannerProducts[current - 1]?.name || ''}`}
      </div>

      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[autoplayPlugin.current]}
        opts={{
          align: 'start',
          loop: true,
        }}
        ariaLabel="Featured products carousel"
      >
        <CarouselContent>
          {bannerProducts.map((product) => (
            <CarouselItem key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="relative block w-full overflow-hidden rounded-lg group/item"
              >
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/6]">
                  <Image
                    src={product.banner}
                    alt={`${product.name} - ${product.category}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                    priority={bannerProducts.indexOf(product) === 0}
                    loading={bannerProducts.indexOf(product) === 0 ? 'eager' : 'lazy'}
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                  <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 text-white space-y-2 sm:space-y-4 max-w-lg">
                    <Badge className="bg-primary/90 backdrop-blur-sm hover:bg-primary">
                      {product.category}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
                      {product.name}
                    </h2>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-semibold">
                      {formatCurrency(Number(product.price))}
                    </p>
                    <div className="inline-block mt-2 sm:mt-4">
                      <span className="inline-flex items-center gap-2 text-sm sm:text-base font-medium border-b-2 border-white/50 pb-1 group-hover/item:border-white transition-all">
                        View product
                        <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {bannerProducts.length > 1 && (
          <>
            <CarouselPrevious
              className="left-4 h-10 w-10 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              variant="ghost"
            />
            <CarouselNext
              className="right-4 h-10 w-10 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              variant="ghost"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
              {/* Pause/Play button for accessibility */}
              <Button
                onClick={toggleAutoplay}
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {/* Dots navigation */}
              <div className="flex gap-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className="group/dot p-1"
                    aria-label={`Go to slide ${index + 1}: ${bannerProducts[index]?.name || 'Product'}`}
                    aria-current={current === index + 1 ? 'true' : 'false'}
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        current === index + 1
                          ? 'w-8 bg-white'
                          : 'w-1.5 bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}