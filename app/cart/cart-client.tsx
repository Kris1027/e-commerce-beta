'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cart-store';
import { updateCartItem, removeFromCart } from '@/lib/actions/cart-actions';
import { cn, formatNumberWithDecimal } from '@/lib/utils';
import { z } from 'zod';
import { cartItemSchema } from '@/lib/validators';
import { CART_CONSTANTS } from '@/lib/constants/cart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CartItem = z.infer<typeof cartItemSchema>;

interface CartClientProps {
  initialCart: {
    id: string | null;
    items: CartItem[];
    itemsPrice: string;
    shippingPrice: string;
    taxPrice: string;
    totalPrice: string;
  };
}

export default function CartClient({ initialCart }: CartClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const { 
    items, 
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice,
    updateItem,
    removeItem: removeFromStore,
    syncWithServer 
  } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    if (initialCart.items.length > 0) {
      syncWithServer(initialCart);
    }
  }, [initialCart, syncWithServer]);

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    // Validate quantity
    if (newQty < 1 || newQty > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
      toast.error(`Quantity must be between 1 and ${CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}`);
      return;
    }
    
    startTransition(async () => {
      // Optimistic update
      updateItem(productId, newQty);
      
      const result = await updateCartItem(productId, newQty);
      if (!result.success) {
        toast.error(result.message || 'Failed to update quantity');
        // Revert on error
        router.refresh();
      }
    });
  };

  const handleRemoveClick = (productId: string, productName: string) => {
    setItemToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!itemToDelete) return;
    
    startTransition(async () => {
      removeFromStore(itemToDelete.id);
      
      const result = await removeFromCart(itemToDelete.id);
      if (result.success) {
        toast.success(`${itemToDelete.name} removed from cart`);
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to remove item');
        router.refresh();
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
        <p className="mb-6 text-muted-foreground">Add some products to get started</p>
        <Link
          href="/products"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex gap-4">
                <Link href={`/products/${item.slug}`}>
                  <div className="relative h-24 w-24 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Link 
                        href={`/products/${item.slug}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ${item.price} each
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveClick(item.productId, item.name)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive/80 cursor-pointer"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.qty - 1)}
                        disabled={item.qty <= 1 || isPending}
                        className={cn(
                          "h-8 w-8 rounded-md border flex items-center justify-center transition-colors",
                          item.qty <= 1 || isPending
                            ? "border-muted text-muted-foreground cursor-not-allowed"
                            : "border-input hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        )}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      
                      <input
                        type="number"
                        min="1"
                        max={CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}
                        value={item.qty}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          if (newQty > 0 && newQty <= CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
                            handleUpdateQuantity(item.productId, newQty);
                          }
                        }}
                        onBlur={(e) => {
                          // Reset to 1 if invalid
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            handleUpdateQuantity(item.productId, 1);
                          } else if (value > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
                            handleUpdateQuantity(item.productId, CART_CONSTANTS.MAX_QUANTITY_PER_ITEM);
                          }
                        }}
                        disabled={isPending}
                        className="h-8 w-16 rounded-md border border-input text-center text-sm"
                      />
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.qty + 1)}
                        disabled={isPending}
                        className={cn(
                          "h-8 w-8 rounded-md border flex items-center justify-center transition-colors",
                          isPending
                            ? "border-muted text-muted-foreground cursor-not-allowed"
                            : "border-input hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        )}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <p className="font-medium">
                      ${formatNumberWithDecimal(parseFloat(item.price) * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${itemsPrice}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {parseFloat(shippingPrice) === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${shippingPrice}`
                )}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${taxPrice}</span>
            </div>
            
            <div className="my-3 h-px bg-border" />
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Proceed to Checkout
            </Link>
            
            <Link
              href="/products"
              className="flex w-full items-center justify-center rounded-md border border-input px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Continue Shopping
            </Link>
          </div>
          
          {parseFloat(itemsPrice) < CART_CONSTANTS.FREE_SHIPPING_THRESHOLD && (
            <p className="mt-4 text-xs text-muted-foreground">
              Add ${formatNumberWithDecimal(CART_CONSTANTS.FREE_SHIPPING_THRESHOLD - parseFloat(itemsPrice))} more for free shipping
            </p>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Item from Cart</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {itemToDelete?.name} from your cart?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={isPending}
              className="flex-1 sm:flex-none rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}