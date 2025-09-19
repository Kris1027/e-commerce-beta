import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import * as userActions from '@/lib/actions/user-actions';
import { getWishlistCount } from '@/lib/actions/wishlist-actions';
import ProfileForm from '@/components/profile/profile-form';
import { Package, Truck, CheckCircle, Clock, Ban, Heart } from 'lucide-react';
import Link from 'next/link';
import { LOCALE } from '@/lib/constants/cart';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const userResult = await userActions.getCurrentUser();
  const [stats, wishlistCount] = await Promise.all([
    userActions.getOrderStats(),
    getWishlistCount(),
  ]);
  
  if (!userResult || !userResult.success || !userResult.data) {
    redirect('/auth/signin');
  }
  
  const user = userResult.data;
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-6">Account Information</h2>
              <ProfileForm user={user} />
            </div>
          </div>
          
          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Order Statistics */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Order Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                  </div>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <span className="font-semibold">{stats.pendingOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Shipped</span>
                  </div>
                  <span className="font-semibold">{stats.shippedOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Delivered</span>
                  </div>
                  <span className="font-semibold">{stats.deliveredOrders}</span>
                </div>
                
                {stats.cancelledOrders > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">Cancelled</span>
                    </div>
                    <span className="font-semibold">{stats.cancelledOrders}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Wishlist Card */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Wishlist</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{wishlistCount}</p>
                    <p className="text-sm text-muted-foreground">Saved items</p>
                  </div>
                </div>
                <Link 
                  href="/wishlist" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
            
            {/* Account Info */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Account Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString(LOCALE, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}