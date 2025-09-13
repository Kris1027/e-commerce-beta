import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCart } from '@/lib/actions/cart-actions';
import { getShippingAddress, getPaymentMethod } from '@/lib/actions/checkout-actions';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import PlaceOrderButton from '@/components/checkout/place-order-button';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrderReviewPage() {
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
  
  // Check if payment method is saved
  const paymentMethod = await getPaymentMethod();
  if (!paymentMethod) {
    redirect('/checkout/payment');
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CheckoutSteps activeStep={2} />
        
        <h1 className="mt-8 text-2xl font-bold">Review Your Order</h1>
        
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Shipping Address</h2>
                <a href="/checkout/shipping" className="text-sm text-primary hover:underline">
                  Edit
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.fullName}<br />
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.zipCode}<br />
                {shippingAddress.country}
              </p>
            </div>
            
            {/* Payment Method */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <a href="/checkout/payment" className="text-sm text-primary hover:underline">
                  Edit
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                {paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : paymentMethod}
              </p>
            </div>
            
            {/* Order Items */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Order Items</h2>
                <a href="/cart" className="text-sm text-primary hover:underline">
                  Edit
                </a>
              </div>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {item.qty}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(parseFloat(item.price) * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6 sticky top-4">
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
                  <div className="flex justify-between font-semibold text-base">
                    <span>Order Total</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <PlaceOrderButton 
                  cart={cart}
                  shippingAddress={shippingAddress}
                  paymentMethod={paymentMethod}
                />
              </div>
              
              {paymentMethod === 'cashOnDelivery' && (
                <p className="mt-4 text-xs text-muted-foreground text-center">
                  You will pay when your order is delivered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}