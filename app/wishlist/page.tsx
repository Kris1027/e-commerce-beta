import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getWishlist } from '@/lib/actions/wishlist-actions';
import WishlistContent from '@/components/wishlist/wishlist-content';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'View and manage your wishlist items',
};

export default async function WishlistPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/wishlist');
  }

  const wishlistResult = await getWishlist();
  const wishlistItems = wishlistResult.success ? wishlistResult.data : [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          {!wishlistResult.success 
            ? 'Error loading wishlist'
            : wishlistItems.length === 0 
            ? 'Your wishlist is empty' 
            : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist`}
        </p>
      </div>

      <WishlistContent items={wishlistItems} />
    </div>
  );
}