// Cart business logic constants
export const CART_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD: 100,
  SHIPPING_PRICE: 10,
  TAX_RATE: 0.1,
  MAX_QUANTITY_PER_ITEM: 99,
  CART_SESSION_DURATION: 60 * 60 * 24 * 30, // 30 days in seconds
} as const;

// Helper function to calculate cart prices
export const calculateCartPrices = (itemsPrice: number) => {
  const shippingPrice = itemsPrice > CART_CONSTANTS.FREE_SHIPPING_THRESHOLD 
    ? 0 
    : CART_CONSTANTS.SHIPPING_PRICE;
  const taxPrice = itemsPrice * CART_CONSTANTS.TAX_RATE;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};