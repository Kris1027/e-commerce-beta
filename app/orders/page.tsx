import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getOrders } from '@/lib/actions/order-actions';
import { formatCurrency, formatDateTime, formatOrderStatus, getOrderStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag } from 'lucide-react';

export default async function OrdersPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const orders = await getOrders();
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
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
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const { dateOnly } = formatDateTime(order.createdAt);
              const statusColor = getOrderStatusColor(order.status);
              
              return (
                <div key={order.id} className="rounded-lg border bg-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-sm font-medium break-all">
                          {order.id}
                        </h2>
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
                        View Details
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {order.orderitems.slice(0, 2).map((item) => (
                      <div key={item.productId} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.qty} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(parseFloat(item.price) * item.qty)}
                        </p>
                      </div>
                    ))}
                    
                    {order.orderitems.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        +{order.orderitems.length - 2} more item(s)
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Payment: {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}
                    </div>
                    <div className="text-lg font-semibold">
                      Total: {formatCurrency(order.totalPrice)}
                    </div>
                  </div>
                  
                  {order.status === 'pending' && order.paymentMethod === 'cashOnDelivery' && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Payment will be collected upon delivery
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}