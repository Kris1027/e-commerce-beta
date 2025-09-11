import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { cartItemSchema } from '@/lib/validators';
import { calculateCartPrices } from '@/lib/constants/cart';
import { type Coupon, calculateDiscount } from '@/lib/constants/coupons';

type CartItem = z.infer<typeof cartItemSchema>;

interface CartStore {
  items: CartItem[];
  itemsCount: number;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
  isOpen: boolean;
  appliedCoupon: Coupon | null;
  discountAmount: string;
  
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  syncWithServer: (serverCart: {
    items: CartItem[];
    itemsPrice: string;
    shippingPrice: string;
    taxPrice: string;
    totalPrice: string;
  }) => void;
}

const calculatePrices = (items: CartItem[], coupon: Coupon | null = null) => {
  // Prices are stored as strings for precision, parseFloat is necessary
  // This calculation only runs when cart changes, not on every render
  const itemsPrice = items.reduce(
    (sum, item) => {
      const price = parseFloat(item.price);
      if (isNaN(price)) {
        console.error(`Invalid price for item ${item.name}: ${item.price}`);
        return sum; // Skip invalid items instead of throwing
      }
      return sum + price * item.qty;
    },
    0
  );
  
  let discountAmount = 0;
  if (coupon) {
    discountAmount = calculateDiscount(coupon, itemsPrice);
  }
  
  const discountedItemsPrice = Math.max(0, itemsPrice - discountAmount);
  const prices = calculateCartPrices(discountedItemsPrice);
  
  return {
    itemsPrice: itemsPrice.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    shippingPrice: prices.shippingPrice.toFixed(2),
    taxPrice: prices.taxPrice.toFixed(2),
    totalPrice: prices.totalPrice.toFixed(2),
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
      discountAmount: '0',
      isOpen: false,
      appliedCoupon: null,
      
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
          
          const prices = calculatePrices(newItems, state.appliedCoupon);
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
            const prices = calculatePrices(newItems, state.appliedCoupon);
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
          const prices = calculatePrices(newItems, state.appliedCoupon);
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
          const prices = calculatePrices(newItems, state.appliedCoupon);
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
          discountAmount: '0',
          appliedCoupon: null,
        }),
      
      setOpen: (open) => set({ isOpen: open }),
      
      applyCoupon: (coupon) =>
        set((state) => {
          const prices = calculatePrices(state.items, coupon);
          return {
            appliedCoupon: coupon,
            ...prices,
          };
        }),
      
      removeCoupon: () =>
        set((state) => {
          const prices = calculatePrices(state.items, null);
          return {
            appliedCoupon: null,
            ...prices,
          };
        }),
      
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