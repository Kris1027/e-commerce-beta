export interface Coupon {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
}

// Sample coupons for development/demo
export const SAMPLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    type: 'percentage',
    value: 10,
    minPurchase: 0,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usedCount: 0,
  },
  {
    code: 'SAVE20',
    description: '20% off orders over $100',
    type: 'percentage',
    value: 20,
    minPurchase: 100,
    maxDiscount: 50,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usedCount: 0,
  },
  {
    code: 'SHIP5',
    description: '$5 off shipping',
    type: 'fixed',
    value: 5,
    minPurchase: 25,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usedCount: 0,
  },
];

export function validateCoupon(code: string, subtotal: number): {
  valid: boolean;
  message: string;
  coupon?: Coupon;
} {
  const coupon = SAMPLE_COUPONS.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of $${coupon.minPurchase} required`,
    };
  }

  return { valid: true, message: 'Coupon applied successfully', coupon };
}

export function calculateDiscount(
  coupon: Coupon,
  subtotal: number
): number {
  if (coupon.type === 'percentage') {
    const discount = (subtotal * coupon.value) / 100;
    return coupon.maxDiscount
      ? Math.min(discount, coupon.maxDiscount)
      : discount;
  } else {
    return Math.min(coupon.value, subtotal);
  }
}