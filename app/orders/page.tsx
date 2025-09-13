import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getMyOrders } from '@/lib/actions/user-actions';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { Package, ShoppingBag } from 'lucide-react';

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { orders, totalPages, totalOrders } = await getMyOrders(currentPage);
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">My Orders</h1>
          {totalOrders > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total orders: {totalOrders} | Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
        
        {orders.length === 0 && currentPage === 1 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              No orders found on this page
            </p>
            <Button asChild variant="outline">
              <Link href="/orders">
                Go to first page
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h2 className="text-sm font-medium text-muted-foreground">
                            Order ID
                          </h2>
                          <span className="text-sm font-mono break-all">
                            {order.id}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                            {order.formattedStatus}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {order.formattedDate.dateOnly} at {order.formattedDate.timeOnly}
                        </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full lg:w-auto">
                          <Link href={`/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {order.orderitems.map((item) => (
                          <div key={item.productId} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.qty} × {formatCurrency(item.price)}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {formatCurrency(parseFloat(item.price) * item.qty)}
                            </p>
                          </div>
                        ))}
                        
                        {order.orderitems.length === 3 && (
                          <p className="text-sm text-muted-foreground italic">
                            View details for all items...
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Payment Method:</span>{' '}
                          {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}
                        </div>
                        <div className="text-lg font-semibold">
                          Total: {formatCurrency(order.totalPrice)}
                        </div>
                      </div>
                      
                      {order.status === 'pending' && order.paymentMethod === 'cashOnDelivery' && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Payment will be collected upon delivery
                          </p>
                        </div>
                      )}
                      
                      {order.status === 'processing' && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Your order is being prepared for shipment
                          </p>
                        </div>
                      )}
                      
                      {order.status === 'shipped' && (
                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                          <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            Your order has been shipped and is on the way
                          </p>
                        </div>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Your order has been delivered successfully
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
            
            {/* Pagination */}
            <PaginationWrapper
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/orders"
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
}