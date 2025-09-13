'use client';

import { useTransition } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { addToCart } from '@/lib/actions/cart-actions';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';

// Helper function to determine button text
function getButtonText(isOutOfStock: boolean, isPending: boolean): string {
  if (isOutOfStock) return 'Out of Stock';
  if (isPending) return 'Adding...';
  return 'Add to Cart';
}

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: string;
  slug: string;
  image: string;
  stock?: number;
  quantity?: number;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
  showIcon?: boolean;
  disabled?: boolean;
  buyNow?: boolean;
  onSuccess?: () => void;
}

export function AddToCartButton({
  productId,
  productName,
  price,
  slug,
  image,
  stock = 100,
  quantity = 1,
  variant = 'default',
  className,
  showIcon = true,
  disabled = false,
  buyNow = false,
  onSuccess,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { addItem: addItemToStore, setOpen } = useCartStore();

  const isOutOfStock = stock === 0;
  const isDisabled = disabled || isOutOfStock || isPending;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation(); // Prevent parent click handlers
    
    if (isDisabled) return;

    startTransition(async () => {
      const cartItem = {
        productId,
        name: productName,
        slug,
        image,
        price,
        qty: quantity,
      };

      const result = await addToCart(cartItem);

      if (result.success) {
        addItemToStore(cartItem);
        toast.success(`Added ${quantity} ${productName} to cart!`);
        
        if (buyNow) {
          // For buy now, don't open drawer, callback will handle navigation
          onSuccess?.();
        } else {
          // For regular add to cart, open the drawer
          setOpen(true);
        }
      } else {
        toast.error(result.message || 'Failed to add to cart');
      }
    });
  };

  // Icon-only variant (for product cards)
  if (variant === 'icon') {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        size="icon"
        className={cn(
          'rounded-full h-8 w-8 transition-all duration-200',
          'hover:scale-110',
          'disabled:hover:scale-100',
          className
        )}
        aria-label={isOutOfStock ? 'Out of stock' : `Add ${productName} to cart`}
      >
        {isPending ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // Compact variant (smaller button)
  if (variant === 'compact') {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        size="sm"
        className={cn(className)}
      >
        {showIcon && <ShoppingCart className="h-3 w-3" />}
        {getButtonText(isOutOfStock, isPending)}
      </Button>
    );
  }

  // Default variant (full button)
  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={cn('w-full', className)}
    >
      {showIcon && <ShoppingCart className="h-4 w-4" />}
      {isOutOfStock
        ? 'Out of Stock'
        : isPending
        ? buyNow ? 'Processing...' : 'Adding...'
        : buyNow ? 'Buy Now' : 'Add to Cart'}
    </Button>
  );
}