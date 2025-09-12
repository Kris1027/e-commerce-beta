import { Metadata } from 'next';
import { auth } from '@/auth';
import { getCart } from '@/lib/actions/cart-actions';
import CartClient from './cart-client';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart',
};

export default async function CartPage() {
  const [cart, session] = await Promise.all([
    getCart(),
    auth()
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <CartClient initialCart={cart} isAuthenticated={!!session} />
    </div>
  );
}