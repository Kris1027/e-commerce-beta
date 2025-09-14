'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cart-store';
import { updateCartItem, removeFromCart } from '@/lib/actions/cart-actions';
import { formatCurrency, validateQuantity } from '@/lib/utils';
import { z } from 'zod';
import { cartItemSchema } from '@/lib/validators';
import { CART_CONSTANTS } from '@/lib/constants/cart';
import { CouponForm } from '@/components/cart/coupon-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isAuthenticated: boolean;
}

export default function CartClient({ initialCart, isAuthenticated }: CartClientProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const { 
    items, 
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice,
    discountAmount,
    appliedCoupon,
    addItem: addItemToStore,
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
    
    // Get previous quantity for potential rollback
    const previousItem = items.find(item => item.productId === productId);
    const previousQty = previousItem?.qty || 1;
    
    startTransition(async () => {
      // Optimistic update
      updateItem(productId, newQty);
      
      const result = await updateCartItem(productId, newQty);
      if (!result.success) {
        toast.error(result.message || 'Failed to update quantity');
        // Revert optimistic update by restoring previous quantity
        updateItem(productId, previousQty);
      }
    });
  };

  const handleRemoveClick = (productId: string, productName: string) => {
    setItemToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!itemToDelete) return;
    
    // Get the item to be removed for potential rollback
    const itemToRemove = items.find(item => item.productId === itemToDelete.id);
    
    startTransition(async () => {
      // Optimistic update - remove from store
      removeFromStore(itemToDelete.id);
      
      const result = await removeFromCart(itemToDelete.id);
      if (result.success) {
        toast.success(`${itemToDelete.name} removed from cart`);
      } else {
        toast.error(result.message || 'Failed to remove item');
        // Revert by adding the item back to the store
        if (itemToRemove) {
          addItemToStore(itemToRemove);
        }
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
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleRemoveClick(item.productId, item.name)}
                      disabled={isPending}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleUpdateQuantity(item.productId, item.qty - 1)}
                        disabled={item.qty <= 1 || isPending}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="1"
                        max={CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}
                        value={quantityInputs[item.productId] ?? item.qty}
                        onChange={(e) => {
                          // Update local state only
                          setQuantityInputs(prev => ({
                            ...prev,
                            [item.productId]: e.target.value
                          }));
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          const finalQty = validateQuantity(value);

                          // Clear local state and update server if changed
                          setQuantityInputs(prev => {
                            const newState = { ...prev };
                            delete newState[item.productId];
                            return newState;
                          });

                          if (finalQty !== item.qty) {
                            handleUpdateQuantity(item.productId, finalQty);
                          }
                        }}
                        disabled={isPending}
                        className="h-8 w-16 text-center"
                      />
                      
                      <Button
                        onClick={() => handleUpdateQuantity(item.productId, item.qty + 1)}
                        disabled={isPending}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="font-medium">
                      {formatCurrency(parseFloat(item.price) * item.qty)}
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
          
          {/* Coupon Form */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">Promo Code</p>
            <CouponForm />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(itemsPrice)}</span>
            </div>
            
            {appliedCoupon && discountAmount && discountAmount !== '0' && discountAmount !== '0.00' && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {parseFloat(shippingPrice) === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatCurrency(shippingPrice)
                )}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(taxPrice)}</span>
            </div>
            
            <div className="my-3 h-px bg-border" />
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {isAuthenticated ? (
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <Link
                href="/auth/signin?callbackUrl=/checkout"
                className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign in to Checkout
              </Link>
            )}
            
            <Link
              href="/products"
              className="flex w-full items-center justify-center rounded-md border border-input px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Continue Shopping
            </Link>
          </div>
          
          {parseFloat(itemsPrice) < CART_CONSTANTS.FREE_SHIPPING_THRESHOLD && (
            <p className="mt-4 text-xs text-muted-foreground">
              Add {formatCurrency(CART_CONSTANTS.FREE_SHIPPING_THRESHOLD - parseFloat(itemsPrice))} more for free shipping
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
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              disabled={isPending}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}