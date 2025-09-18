import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  MoreHorizontal,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import prisma from '@/db/prisma';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPercentageChanges } from '@/lib/services/analytics-service';

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
  const [stats, percentageChanges] = await Promise.all([
    getAdminStats(),
    getPercentageChanges()
  ]);

  // Use analytics service for percentage changes
  const { revenueChange, ordersChange, customersChange, productsChange } = percentageChanges;

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: revenueChange,
      description: 'vs last month',
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-500',
      href: '/admin/revenue',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: ordersChange,
      description: `${stats.todayOrders} today`,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
      href: '/admin/orders',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: customersChange,
      description: 'active users',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-500',
      href: '/admin/customers',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      change: productsChange,
      description: `${stats.lowStockProducts} low stock`,
      gradient: 'from-orange-500/10 to-red-500/10',
      iconBg: stats.lowStockProducts > 0 ? 'bg-orange-500/10 dark:bg-orange-500/20' : 'bg-gray-500/10 dark:bg-gray-500/20',
      iconColor: stats.lowStockProducts > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-gray-600 dark:text-gray-500',
      href: '/admin/products',
    },
  ];

  const quickStats = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: AlertCircle,
      color: 'text-yellow-600 dark:text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders.toString(),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews.toString(),
      icon: Star,
      color: 'text-blue-600 dark:text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    // TODO: Add Page Views metric once analytics tracking is implemented
    // Requires integration with analytics service (Google Analytics, Plausible, etc.)
  ];

  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border shadow-sm">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Monitor your store performance and manage operations
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/admin/analytics">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/admin/products/new">
                <Button size="sm" className="gap-2">
                  <Package className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <Link key={stat.title} href={stat.href}>
              <Card className={cn(
                "relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer",
                stat.gradient
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg", stat.iconBg)}>
                      <Icon className={cn("h-4 w-4", stat.iconColor)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold tracking-tight">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.change !== 0 && (
                        <div className={cn(
                          "flex items-center gap-0.5",
                          isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                        )}>
                          <TrendIcon className="h-3 w-3" />
                          <span className="font-medium">
                            {Math.abs(stat.change)}%
                          </span>
                        </div>
                      )}
                      <span className="text-muted-foreground">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={cn('p-2.5 rounded-xl', stat.bgColor)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold tabular-nums">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.title}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Tables Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders with Enhanced UI */}
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest customer transactions
              </p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {order.user?.name || 'Guest User'}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            #{order.id.slice(-6).toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                        <Badge
                          variant={order.status === 'delivered' ? 'default' : 'outline'}
                          className="mt-1"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders will appear here once customers make purchases
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert with Progress Bars */}
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Inventory Alerts</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Products requiring restocking
              </p>
            </div>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.topProducts.filter(p => p.stock <= 10).length > 0 ? (
                stats.topProducts
                  .filter(p => p.stock <= 10)
                  .slice(0, 5)
                  .map((product) => {
                    // Consider 20 items as optimal stock level for progress visualization
                    const OPTIMAL_STOCK_LEVEL = 20;
                    const stockPercentage = Math.min((product.stock / OPTIMAL_STOCK_LEVEL) * 100, 100);
                    const isLow = product.stock <= 5;
                    const isCritical = product.stock <= 2;

                    return (
                      <div
                        key={product.id}
                        className="px-6 py-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-medium line-clamp-1">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(product.price)}
                                </span>
                                <Badge
                                  variant={isCritical ? "destructive" : isLow ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {product.stock} units left
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Restock
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Progress
                              value={stockPercentage}
                              className={cn(
                                "h-2",
                                isCritical && "[&>div]:bg-red-500",
                                isLow && !isCritical && "[&>div]:bg-orange-500"
                              )}
                            />
                            <p className="text-xs text-muted-foreground">
                              Stock level: {stockPercentage.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="px-6 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">All products well stocked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No inventory alerts at this time
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}