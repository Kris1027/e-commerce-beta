'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/wishlist-actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { buildAuthUrl } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  className?: string;
  variant?: 'icon' | 'button';
}

export function WishlistButton({ 
  productId, 
  isInWishlist: initialIsInWishlist, 
  className,
  variant = 'icon' 
}: WishlistButtonProps) {
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        const result = await toggleWishlist(productId);
        
        if (result.success) {
          setIsInWishlist(result.isInWishlist);
          toast.success(result.message);
        } else {
          if (result.message?.includes('sign in')) {
            toast.error('Please sign in to use wishlist');
            router.push(buildAuthUrl('/auth/signin', window.location.pathname));
          } else {
            toast.error(result.message || 'Failed to update wishlist');
          }
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        toast.error('Failed to update wishlist');
      }
    });
  };

  if (variant === 'button') {
    return (
      <Button
        variant={isInWishlist ? 'secondary' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={className}
      >
        <Heart
          className={cn(
            'mr-2 h-4 w-4 transition-colors',
            isInWishlist && 'fill-red-500 text-red-500'
          )}
        />
        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'rounded-full bg-background/80 p-2 backdrop-blur transition-opacity cursor-pointer',
        'hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isInWishlist ? 'fill-red-500 text-red-500' : 'text-foreground',
          isPending && 'animate-pulse'
        )}
      />
    </button>
  );
}