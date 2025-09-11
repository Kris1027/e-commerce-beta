import { redirect } from 'next/navigation';

// Redirect to shipping page when accessing /checkout
export default function CheckoutPage() {
  redirect('/checkout/shipping');
}