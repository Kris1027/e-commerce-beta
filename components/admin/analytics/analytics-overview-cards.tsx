import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface AnalyticsOverviewCardsProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    currentMonthRevenue: number;
    currentMonthOrders: number;
    averageOrderValue: number;
    revenueChange: number;
    ordersChange: number;
  };
}

export function AnalyticsOverviewCards({ data }: AnalyticsOverviewCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      change: data.revenueChange,
      description: 'This month: ' + formatCurrency(data.currentMonthRevenue),
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-500',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString('pl-PL'),
      icon: ShoppingCart,
      change: data.ordersChange,
      description: `This month: ${data.currentMonthOrders}`,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-500',
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: Package,
      change: 0,
      description: 'Per transaction',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-500',
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toLocaleString('pl-PL'),
      icon: Users,
      change: 0,
      description: 'Registered users',
      gradient: 'from-orange-500/10 to-red-500/10',
      iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card
            key={card.title}
            className={cn(
              'relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all hover:shadow-lg',
              card.gradient
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', card.iconBg)}>
                  <Icon className={cn('h-4 w-4', card.iconColor)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {card.change !== 0 && (
                    <div
                      className={cn(
                        'flex items-center gap-0.5',
                        isPositive
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-red-600 dark:text-red-500'
                      )}
                    >
                      <TrendIcon className="h-3 w-3" />
                      <span className="font-medium">
                        {Math.abs(card.change).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <span className="text-muted-foreground">{card.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}