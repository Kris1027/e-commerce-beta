import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/actions/order-actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import type { ShippingAddress } from '@/lib/validators';

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) {
    redirect('/orders');
  }
  
  const shippingAddress = order.shippingAddress as ShippingAddress;
  const { dateOnly } = formatDateTime(order.createdAt);
  
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ve received it and will process it soon.
          </p>
        </div>
        
        {/* Order Details Card */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-medium">{formatId(order.id)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{dateOnly}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">
                {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
          <p className="text-sm text-muted-foreground">
            {shippingAddress.fullName}<br />
            {shippingAddress.street}<br />
            {shippingAddress.city}, {shippingAddress.zipCode}<br />
            {shippingAddress.country}
          </p>
        </div>
        
        {/* Order Items */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.orderitems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <p className="font-medium">
                  {formatCurrency(parseFloat(item.price) * item.qty)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>
            {order.discountPrice && parseFloat(order.discountPrice) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountPrice)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>
        
        {/* What's Next */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">What&apos;s Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;re preparing your order for shipment
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive an email with your order details
                </p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/orders">
              <FileText className="mr-2 h-4 w-4" />
              View All Orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}