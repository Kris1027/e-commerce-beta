import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/actions/order-actions';
import { formatCurrency, formatDateTime, formatId, formatOrderStatus, getOrderStatusColor } from '@/lib/utils';
import type { ShippingAddress } from '@/lib/validators';

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) {
    redirect('/orders');
  }
  
  const shippingAddress = order.shippingAddress as ShippingAddress;
  const { dateTime } = formatDateTime(order.createdAt);
  const statusColor = getOrderStatusColor(order.status);
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Order {formatId(order.id)}
              </h1>
              <p className="text-sm text-muted-foreground">
                Placed on {dateTime}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusColor} mt-4 sm:mt-0`}>
              {getStatusIcon(order.status)}
              {formatOrderStatus(order.status)}
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderitems.map((item) => (
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
                      <Link 
                        href={`/products/${item.slug}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {item.qty} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(parseFloat(item.price) * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm">
                    {shippingAddress.fullName}<br />
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.zipCode}<br />
                    {shippingAddress.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact</p>
                  <p className="text-sm">
                    {order.user.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Timeline */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">{dateTime}</p>
                  </div>
                </div>
                
                {order.isPaid && order.paidAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.paidAt).dateTime}
                      </p>
                    </div>
                  </div>
                )}
                
                {order.isDelivered && order.deliveredAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.deliveredAt).dateTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.taxPrice)}</span>
                </div>
                {order.discountPrice && parseFloat(order.discountPrice) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountPrice)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <p className="font-medium">
                      {order.isPaid ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </p>
                  </div>
                  
                  {order.couponCode && (
                    <div>
                      <p className="text-sm text-muted-foreground">Coupon Used</p>
                      <p className="font-medium">{order.couponCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}