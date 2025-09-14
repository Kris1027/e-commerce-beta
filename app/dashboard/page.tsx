import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, Clock, CheckCircle, Truck, Heart, User, ShoppingCart, Shield } from 'lucide-react';
import { getOrders } from '@/lib/actions/order-actions';
import { formatCurrency, formatDateTime, formatOrderStatus, getOrderStatusColor, isActiveOrder } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS } from '@/lib/validators';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch user's orders
  const orders = await getOrders();
  
  // Calculate statistics
  const activeOrders = orders.filter(order => isActiveOrder(order.status));
  
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(order => order.status === ORDER_STATUS.DELIVERED).length;
  const pendingOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING).length;
  
  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold">{activeOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{deliveredOrders}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link
          href="/orders"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Orders</p>
              <p className="text-lg font-semibold">View All</p>
            </div>
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wishlist</p>
              <p className="text-lg font-semibold">Manage</p>
            </div>
          </div>
        </Link>

        <Link
          href="/cart"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shopping Cart</p>
              <p className="text-lg font-semibold">View Cart</p>
            </div>
          </div>
        </Link>

        <Link
          href="/profile"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile & Addresses</p>
              <p className="text-lg font-semibold">Manage</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Panel Link for Admin Users */}
      {session.user.role === 'admin' && (
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-6 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-red-600 dark:text-red-400">Access Admin Panel</span>
          </Link>
        </div>
      )}

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const { dateOnly } = formatDateTime(order.createdAt);
              const statusColor = getOrderStatusColor(order.status);
              
              return (
                <div key={order.id} className="rounded-lg border bg-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-medium break-all">
                          Order {order.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {formatOrderStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {dateOnly}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.id}`}>
                        Track Order
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {order.orderitems.length} item(s)
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(order.totalPrice)}
                    </div>
                  </div>
                  
                  {order.status === ORDER_STATUS.SHIPPED && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your order is on the way! Expected delivery in 2-3 days.
                      </p>
                    </div>
                  )}
                  
                  {order.status === ORDER_STATUS.PROCESSING && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We&apos;re preparing your order for shipment.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          {orders.length > 0 && (
            <Link
              href="/orders"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          )}
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const { dateOnly } = formatDateTime(order.createdAt);
              const statusColor = getOrderStatusColor(order.status);
              
              return (
                <div key={order.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium break-all">
                          {order.id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dateOnly}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(order.totalPrice)}
                        </p>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground text-center py-8">
              You haven&apos;t placed any orders yet.
            </p>
            <div className="text-center">
              <Button asChild>
                <Link href="/products">
                  Start Shopping
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Access */}
      {session.user.role === 'admin' && (
        <div className="mt-8 p-6 rounded-lg border bg-primary/5">
          <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
          <Button asChild>
            <Link href="/admin">
              Go to Admin Panel
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}