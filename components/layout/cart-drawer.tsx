'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cart-store';
import { updateCartItem, removeFromCart } from '@/lib/actions/cart-actions';
import { formatNumberWithDecimal, cn } from '@/lib/utils';
import { CART_CONSTANTS } from '@/lib/constants/cart';
import { CouponForm } from '@/components/cart/coupon-form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function CartDrawer() {
  const {
    items,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    discountAmount,
    appliedCoupon,
    isOpen,
    setOpen,
    updateItem,
    removeItem: removeFromStore,
  } = useCartStore();

  // Hydrate on mount
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1 || newQty > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
      toast.error(`Quantity must be between 1 and ${CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}`);
      return;
    }

    const previousItem = items.find(item => item.productId === productId);
    const previousQty = previousItem?.qty || 1;

    // Optimistic update
    updateItem(productId, newQty);

    const result = await updateCartItem(productId, newQty);
    if (!result.success) {
      toast.error(result.message || 'Failed to update quantity');
      // Revert on error
      updateItem(productId, previousQty);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    const itemToRemove = items.find(item => item.productId === productId);
    
    // Optimistic update
    removeFromStore(productId);

    const result = await removeFromCart(productId);
    if (result.success) {
      toast.success(`${productName} removed from cart`);
    } else {
      toast.error(result.message || 'Failed to remove item');
      // Revert by re-adding the item
      if (itemToRemove) {
        useCartStore.getState().addItem(itemToRemove);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length})
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length > 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Your cart is empty. Start shopping to add items!
            </p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 rounded-lg border p-3">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${item.price} each
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          className="text-destructive hover:text-destructive/80"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className={cn(
                              "h-7 w-7 rounded-md border flex items-center justify-center transition-colors",
                              item.qty <= 1
                                ? "border-muted text-muted-foreground cursor-not-allowed"
                                : "border-input hover:bg-accent hover:text-accent-foreground"
                            )}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-12 text-center text-sm">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.qty + 1)}
                            disabled={item.qty >= CART_CONSTANTS.MAX_QUANTITY_PER_ITEM}
                            className={cn(
                              "h-7 w-7 rounded-md border flex items-center justify-center transition-colors",
                              item.qty >= CART_CONSTANTS.MAX_QUANTITY_PER_ITEM
                                ? "border-muted text-muted-foreground cursor-not-allowed"
                                : "border-input hover:bg-accent hover:text-accent-foreground"
                            )}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          ${formatNumberWithDecimal(parseFloat(item.price) * item.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-3">
                {/* Coupon Form */}
                <div>
                  <p className="mb-2 text-sm font-medium">Promo Code</p>
                  <CouponForm />
                </div>

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${itemsPrice}</span>
                  </div>
                  {appliedCoupon && parseFloat(discountAmount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-${discountAmount}</span>
                    </div>
                  )}
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
                  <div className="my-2 h-px bg-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-md border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Checkout
                </Link>
              </div>

              {parseFloat(itemsPrice) < CART_CONSTANTS.FREE_SHIPPING_THRESHOLD && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Add ${formatNumberWithDecimal(CART_CONSTANTS.FREE_SHIPPING_THRESHOLD - parseFloat(itemsPrice))}{' '}
                  more for free shipping
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}