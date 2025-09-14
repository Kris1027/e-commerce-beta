import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Star,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import prisma from '@/db/prisma';
import { UserRole } from '@prisma/client';

async function getAdminStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      totalRevenue,
      todayOrders,
      totalReviews,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { role: UserRole.user } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 10 } } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['delivered', 'shipped', 'processing'] } },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.review.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        images: true,
      },
    });

    return {
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      todayOrders,
      totalReviews,
      recentOrders,
      topProducts,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      totalRevenue: 0,
      todayOrders: 0,
      totalReviews: 0,
      recentOrders: [],
      topProducts: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: `${stats.todayOrders} today`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: '+5.2%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      change: `${stats.lowStockProducts} low stock`,
      changeType: stats.lowStockProducts > 0 ? 'warning' as const : 'neutral' as const,
    },
  ];

  const quickStats = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews.toString(),
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Page Views',
      value: '12.5K',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={cn(
                    'text-xs mt-1',
                    stat.changeType === 'positive' && 'text-green-600',
                    stat.changeType === 'warning' && 'text-yellow-600',
                    stat.changeType === 'neutral' && 'text-gray-600'
                  )}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4" style={{ borderLeftColor: stat.color.replace('text-', '#').replace('600', '') }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={cn('p-2 rounded-full', stat.bgColor)}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-sm text-gray-600">
                        Order #{order.id.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.filter(p => p.stock <= 10).length > 0 ? (
                stats.topProducts
                  .filter(p => p.stock <= 10)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'font-medium',
                          product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'
                        )}>
                          {product.stock} left
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-600">All products are well stocked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}