import { getUserDetailsForAdmin } from '@/lib/actions/user-actions';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  ShoppingBag,
  Heart,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Building,
  Crown,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import Image from 'next/image';

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user;
  try {
    user = await getUserDetailsForAdmin(id);
  } catch (error) {
    console.error(`Error fetching user details for user ID ${id}:`, error);
    notFound();
  }

  const getAddressTypeIcon = (label?: string | null) => {
    switch (label?.toLowerCase()) {
      case 'home':
        return <Home className="h-3.5 w-3.5" />;
      case 'work':
        return <Building className="h-3.5 w-3.5" />;
      default:
        return <MapPin className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-sm text-muted-foreground">
              View and manage user information
            </p>
          </div>
        </div>
      </div>

      {/* User Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <Badge
                    variant={user.role === UserRole.admin ? 'destructive' : 'default'}
                    className={user.role === UserRole.admin ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0' : ''}
                  >
                    {user.role === UserRole.admin && <Crown className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {user.formattedCreatedAt.dateOnly}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Last updated {user.formattedUpdatedAt.dateOnly}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              ID: {user.id}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{user.stats.totalOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">
                {formatCurrency(user.stats.totalSpent)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wishlist Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-2xl font-bold">{user.stats.totalWishlistItems}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{user.stats.totalAddresses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {user.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {user.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.itemCount} items • {order.formattedDate.dateOnly}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={order.statusColor}>
                          {order.formattedStatus}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status Breakdown */}
          {user.stats.totalOrders > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(user.stats.orderStatusBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {user.addresses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No addresses saved</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getAddressTypeIcon(address.label)}
                          <span className="font-medium">{address.label || 'Address'}</span>
                        </div>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{address.fullName}</p>
                        <p>{address.street}</p>
                        <p>{address.zipCode} {address.city}</p>
                        <p>{address.state}, {address.country}</p>
                        {address.phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist Items</CardTitle>
            </CardHeader>
            <CardContent>
              {user.wishlistItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items in wishlist</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.wishlistItems.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square relative bg-gray-100">
                        {item.product.images && item.product.images[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Account Created</span>
                  <span className="text-sm font-medium">
                    {user.formattedCreatedAt.dateTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">
                    {user.formattedUpdatedAt.dateTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <span className="text-sm font-medium">
                    {user.emailVerified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="text-sm font-medium">{user.stats.totalReviews}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}