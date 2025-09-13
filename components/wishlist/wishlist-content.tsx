'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { removeFromWishlist } from '@/lib/actions/wishlist-actions';
import { addToCart } from '@/lib/actions/cart-actions';
import { useCartStore } from '@/lib/store/cart-store';
import { WISHLIST_CONFIG } from '@/lib/constants/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import type { WishlistItem } from '@/lib/validators';

interface WishlistContentProps {
  items: WishlistItem[];
}

export default function WishlistContent({ items: initialItems }: WishlistContentProps) {
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(new Set());

  const handleRemove = async (productId: string) => {
    setRemovingIds(prev => new Set(prev).add(productId));
    
    try {
      const result = await removeFromWishlist(productId);
      
      if (result.success) {
        setItems(prev => prev.filter(item => item.productId !== productId));
        toast.success('Removed from wishlist');
      } else {
        toast.error(result.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const { product } = item;
    
    if (!product || product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCartIds(prev => new Set(prev).add(product.id));

    try {
      const cartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0] || '/placeholder.svg',
        qty: 1,
      };

      const result = await addToCart(cartItem, { 
        removeFromWishlist: WISHLIST_CONFIG.REMOVE_ON_ADD_TO_CART 
      });
      
      if (result.success) {
        // Optimistic update for cart
        addItem(cartItem);
        toast.success('Added to cart');
        
        // Only update local wishlist state if server confirmed the removal
        // This ensures consistency between client and server state
        if (WISHLIST_CONFIG.REMOVE_ON_ADD_TO_CART) {
          setItems(prev => prev.filter(item => item.product?.id !== product.id));
        }
      } else {
        toast.error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCartIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Your wishlist is empty</h2>
        <p className="mb-6 text-center text-muted-foreground">
          Save items you like to your wishlist and they&apos;ll appear here
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const { product } = item;
        if (!product) return null;
        
        const isRemoving = removingIds.has(product.id);
        const isAddingToCart = addingToCartIds.has(product.id);
        const isOutOfStock = product.stock === 0;

        return (
          <Card key={item.id} className="overflow-hidden">
            <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
              <Image
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <span className="text-lg font-semibold">Out of Stock</span>
                </div>
              )}
            </Link>
            
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <Link href={`/products/${product.slug}`}>
                <h3 className="mb-2 line-clamp-2 text-sm font-medium hover:underline">
                  {product.name}
                </h3>
              </Link>
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>⭐ {product.rating}</span>
                  <span>({product.numReviews})</span>
                </div>
              </div>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="mb-3 text-xs text-orange-600 dark:text-orange-400">
                  Only {product.stock} left in stock
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                  disabled={isOutOfStock || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemove(product.id)}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}