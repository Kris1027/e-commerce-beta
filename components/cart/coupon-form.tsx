'use client';

import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cart-store';
import { validateCoupon } from '@/lib/constants/coupons';

export function CouponForm() {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { itemsPrice, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCartStore();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsApplying(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const validation = validateCoupon(code, parseFloat(itemsPrice));
    
    if (validation.valid && validation.coupon) {
      applyCoupon(validation.coupon);
      toast.success(validation.message);
      setCode('');
    } else {
      toast.error(validation.message);
    }
    
    setIsApplying(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {appliedCoupon.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-900 dark:text-green-100">
              -${discountAmount}
            </span>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApplyCoupon} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isApplying}
        />
      </div>
      <button
        type="submit"
        disabled={!code.trim() || isApplying}
        className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isApplying ? 'Applying...' : 'Apply'}
      </button>
    </form>
  );
}