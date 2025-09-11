import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { cartItemSchema } from '@/lib/validators';

type CartItem = z.infer<typeof cartItemSchema>;

interface CartStore {
  items: CartItem[];
  itemsCount: number;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
  isOpen: boolean;
  
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  syncWithServer: (serverCart: {
    items: CartItem[];
    itemsPrice: string;
    shippingPrice: string;
    taxPrice: string;
    totalPrice: string;
  }) => void;
}

const calculatePrices = (items: CartItem[]) => {
  const itemsPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.qty,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = itemsPrice * 0.1;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      itemsCount: 0,
      itemsPrice: '0',
      shippingPrice: '0',
      taxPrice: '0',
      totalPrice: '0',
      isOpen: false,
      
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );
          
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, qty: i.qty + item.qty }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }
          
          const prices = calculatePrices(newItems);
          const itemsCount = newItems.reduce((sum, item) => sum + item.qty, 0);
          
          return {
            items: newItems,
            itemsCount,
            ...prices,
          };
        }),
      
      updateItem: (productId, qty) =>
        set((state) => {
          if (qty === 0) {
            const newItems = state.items.filter(
              (item) => item.productId !== productId
            );
            const prices = calculatePrices(newItems);
            const itemsCount = newItems.reduce((sum, item) => sum + item.qty, 0);
            
            return {
              items: newItems,
              itemsCount,
              ...prices,
            };
          }
          
          const newItems = state.items.map((item) =>
            item.productId === productId ? { ...item, qty } : item
          );
          const prices = calculatePrices(newItems);
          const itemsCount = newItems.reduce((sum, item) => sum + item.qty, 0);
          
          return {
            items: newItems,
            itemsCount,
            ...prices,
          };
        }),
      
      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.productId !== productId
          );
          const prices = calculatePrices(newItems);
          const itemsCount = newItems.reduce((sum, item) => sum + item.qty, 0);
          
          return {
            items: newItems,
            itemsCount,
            ...prices,
          };
        }),
      
      clearCart: () =>
        set({
          items: [],
          itemsCount: 0,
          itemsPrice: '0',
          shippingPrice: '0',
          taxPrice: '0',
          totalPrice: '0',
        }),
      
      setOpen: (open) => set({ isOpen: open }),
      
      syncWithServer: (serverCart) =>
        set({
          items: serverCart.items,
          itemsCount: serverCart.items.reduce((sum, item) => sum + item.qty, 0),
          itemsPrice: serverCart.itemsPrice,
          shippingPrice: serverCart.shippingPrice,
          taxPrice: serverCart.taxPrice,
          totalPrice: serverCart.totalPrice,
        }),
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);