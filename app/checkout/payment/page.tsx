import { redirect } from 'next/navigation';
import { getCart } from '@/lib/actions/cart-actions';
import { getShippingAddress, getPaymentMethod } from '@/lib/actions/checkout-actions';
import { formatCurrency } from '@/lib/utils';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import PaymentMethodForm from '@/components/checkout/payment-method-form';

export default async function PaymentMethodPage() {
  // Check if cart exists and has items
  const cart = await getCart();
  
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }
  
  // Check if shipping address is saved
  const shippingAddress = await getShippingAddress();
  if (!shippingAddress) {
    redirect('/checkout/shipping');
  }
  
  // Get saved payment method if any
  const savedPaymentMethod = await getPaymentMethod();
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CheckoutSteps activeStep={1} />
        
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PaymentMethodForm 
              initialPaymentMethod={savedPaymentMethod || 'cashOnDelivery'} 
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cart.items.length})</span>
                  <span>{formatCurrency(cart.itemsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(cart.shippingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(cart.taxPrice)}</span>
                </div>
                {cart.discountPrice && parseFloat(cart.discountPrice) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(cart.discountPrice)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">
                  {shippingAddress.fullName}<br />
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.zipCode}<br />
                  {shippingAddress.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}