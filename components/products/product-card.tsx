'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductPrice } from './product-price';
import { AddToCartButton } from './add-to-cart-button';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  className?: string;
}

export function ProductCard({ product, isInWishlist = false, className }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock = product.stock === 0;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      {product.isFeatured && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          Featured
        </span>
      )}

      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <WishlistButton 
          productId={product.id}
          isInWishlist={isInWishlist}
        />
      </div>

      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[imageIndex] || '/placeholder.svg'}
          alt={product.name}
          fill
          className={cn(
            'object-cover transition-transform duration-300',
            isHovered && 'scale-110'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onMouseMove={(e) => {
            if (product.images.length > 1 && isHovered) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const newIndex = x > 50 ? 1 : 0;
              setImageIndex(Math.min(newIndex, product.images.length - 1));
            }
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <span className="text-lg font-semibold">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="line-clamp-2 text-sm font-medium leading-tight hover:underline">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>

        <div className="mb-3 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.floor(Number(product.rating))
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted'
              )}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            ({product.numReviews})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <ProductPrice price={product.price} size="sm" />
          {!isOutOfStock && (
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              slug={product.slug}
              image={product.images[0] || '/placeholder.svg'}
              stock={product.stock}
              variant="icon"
            />
          )}
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            Only {product.stock} left in stock
          </p>
        )}
      </div>
    </div>
  );
}