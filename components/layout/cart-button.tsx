'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { getCart } from '@/lib/actions/cart-actions';

export function CartButton() {
  const { itemsCount, syncWithServer } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    
    const loadCart = async () => {
      const serverCart = await getCart();
      if (serverCart.items.length > 0) {
        syncWithServer(serverCart);
      }
    };
    
    loadCart();
  }, [syncWithServer]);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemsCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {itemsCount > 99 ? '99+' : itemsCount}
          </span>
        )}
      </div>
      <span className="hidden lg:inline">Cart</span>
    </Link>
  );
}