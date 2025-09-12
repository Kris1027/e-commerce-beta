import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getCart } from '@/lib/actions/cart-actions';
import CheckoutSteps from '@/components/checkout/checkout-steps';
import CheckoutAddressSelector from '@/components/checkout/checkout-address-selector';

export const metadata: Metadata = {
  title: 'Shipping Address',
  description: 'Select your shipping address',
};

export default async function ShippingPage() {
  const session = await auth();
  const cart = await getCart();

  // Redirect to cart if empty
  if (!cart.items || cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <CheckoutSteps activeStep={0} />
      </div>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold">Select Shipping Address</h1>
        <CheckoutAddressSelector 
          userName={session?.user?.name || ''}
        />
      </div>
    </div>
  );
}