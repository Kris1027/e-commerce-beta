'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addToCart } from '@/lib/actions/cart-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';

interface AddToCartProps {
  productId: string;
  productName: string;
  price: string;
  stock: number;
  slug: string;
  image: string;
}

export function AddToCart({ 
  productId, 
  productName, 
  price, 
  stock, 
  slug, 
  image 
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { addItem: addItemToStore, setOpen } = useCartStore();

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
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
        setOpen(true); // Open cart drawer after adding item
      } else {
        toast.error(result.message || 'Failed to add to cart');
      }
    });
  };

  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-4">
      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Availability:</span>
        {isOutOfStock ? (
          <span className="text-sm font-medium text-destructive">Out of Stock</span>
        ) : stock < 10 ? (
          <span className="text-sm font-medium text-orange-600">
            Only {stock} left in stock
          </span>
        ) : (
          <span className="text-sm font-medium text-green-600">In Stock</span>
        )}
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className={cn(
                'h-8 w-8 rounded-md border flex items-center justify-center transition-colors',
                quantity <= 1
                  ? 'border-muted text-muted-foreground cursor-not-allowed'
                  : 'border-input hover:bg-accent hover:text-accent-foreground cursor-pointer'
              )}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            
            <input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="h-8 w-16 rounded-md border border-input text-center text-sm"
            />
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= stock}
              className={cn(
                'h-8 w-8 rounded-md border flex items-center justify-center transition-colors',
                quantity >= stock
                  ? 'border-muted text-muted-foreground cursor-not-allowed'
                  : 'border-input hover:bg-accent hover:text-accent-foreground cursor-pointer'
              )}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isPending}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-colors',
          isOutOfStock
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
        )}
      >
        <ShoppingCart className="h-4 w-4" />
        {isOutOfStock ? 'Out of Stock' : isPending ? 'Adding...' : 'Add to Cart'}
      </button>

      {/* Buy Now Button */}
      {!isOutOfStock && (
        <button
          onClick={() => {
            handleAddToCart();
            router.push('/cart');
          }}
          disabled={isOutOfStock || isPending}
          className="w-full rounded-md border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
        >
          Buy Now
        </button>
      )}
    </div>
  );
}