import { getAdminOrderById } from '@/lib/actions/admin-order-actions';
import type { ShippingAddress } from '@/lib/validators';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Receipt,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const normalizedStatus = order.status.toLowerCase() as keyof typeof statusIcons;
  const StatusIcon = statusIcons[normalizedStatus] || Clock;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
          </div>
        </div>
        <Badge className={statusColors[normalizedStatus] || statusColors.pending}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderitems.map((item) => (
                  <div key={`${item.orderId}-${item.productId}`} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.name || 'Product not found'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.slug || 'N/A'}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span>Quantity: {item.qty}</span>
                        <span>Price: {item.price}</span>
                        <span className="font-medium">
                          Subtotal: {formatCurrency(parseFloat(item.price) * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items Price:</span>
                  <span>{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Price:</span>
                  <span>{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (23% VAT):</span>
                  <span>{order.taxPrice}</span>
                </div>
                {parseFloat(order.discountPrice) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{order.discountPrice}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Coupon Code:</span>
                    <Badge variant="secondary">{order.couponCode}</Badge>
                  </div>
                )}
                <div className="pt-2 border-t flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{order.totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.user?.name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Since</p>
                <p className="font-medium">
                  {order.user?.createdAt
                    ? formatDateTime(order.user.createdAt).dateOnly
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant={order.user?.role === 'admin' ? 'default' : 'secondary'}>
                  {order.user?.role || 'user'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                  <>
                    <p className="font-medium">
                      {(order.shippingAddress as ShippingAddress).fullName}
                    </p>
                    <p>{(order.shippingAddress as ShippingAddress).street}</p>
                    <p>
                      {(order.shippingAddress as ShippingAddress).zipCode} {(order.shippingAddress as ShippingAddress).city}
                    </p>
                    {(order.shippingAddress as ShippingAddress).state && (
                      <p>{(order.shippingAddress as ShippingAddress).state}</p>
                    )}
                    <p>{(order.shippingAddress as ShippingAddress).country}</p>
                    {(order.shippingAddress as ShippingAddress).phone && (
                      <p>Tel: {(order.shippingAddress as ShippingAddress).phone}</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No shipping address available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              {order.isPaid && order.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="font-medium">
                    {formatDateTime(order.paidAt).dateTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {formatDateTime(order.createdAt).dateTime}
                </p>
              </div>
              {order.isDelivered && order.deliveredAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="font-medium">
                    {formatDateTime(order.deliveredAt).dateTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}