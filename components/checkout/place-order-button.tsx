'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { placeOrder } from '@/lib/actions/order-actions';
import type { CartResponse, ShippingAddress } from '@/lib/validators';

interface PlaceOrderButtonProps {
  cart: CartResponse;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export default function PlaceOrderButton({ 
  cart, 
  shippingAddress, 
  paymentMethod 
}: PlaceOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    
    try {
      const result = await placeOrder({
        cart,
        shippingAddress,
        paymentMethod,
      });
      
      if (result.success && result.orderId) {
        toast.success('Order placed successfully!');
        router.push(`/orders/${result.orderId}/confirmation`);
      } else {
        toast.error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePlaceOrder} 
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? 'Placing Order...' : 'Place Order'}
    </Button>
  );
}