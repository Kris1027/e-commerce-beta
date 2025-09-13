'use client';

import { ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { getCart } from '@/lib/actions/cart-actions';
import { Button } from '@/components/ui/button';

export function CartButton() {
  const { itemsCount, syncWithServer, setOpen } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    
    const loadCart = async () => {
      const serverCart = await getCart();
      // Always sync with server, even if cart is empty
      // This ensures client state is cleared when server cart is empty
      syncWithServer(serverCart);
    };
    
    loadCart();
  }, [syncWithServer]);

  return (
    <Button
      onClick={() => setOpen(true)}
      variant="ghost"
      size="sm"
      className="relative"
      aria-label="Open cart"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemsCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {itemsCount > 99 ? '99+' : itemsCount}
          </span>
        )}
      </div>
      <span className="hidden lg:inline ml-2">Cart</span>
    </Button>
  );
}