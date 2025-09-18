import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface InventoryStatusCardProps {
  data: {
    outOfStock: number;
    lowStock: number;
    inStock: number;
    totalProducts: number;
    inventoryValue: number;
    totalStock: number;
  };
}

export function InventoryStatusCard({ data }: InventoryStatusCardProps) {
  const stockPercentages = {
    inStock: (data.inStock / data.totalProducts) * 100,
    lowStock: (data.lowStock / data.totalProducts) * 100,
    outOfStock: (data.outOfStock / data.totalProducts) * 100,
  };

  const stockItems = [
    {
      label: 'In Stock',
      value: data.inStock,
      percentage: stockPercentages.inStock,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      progressColor: 'bg-green-500',
    },
    {
      label: 'Low Stock',
      value: data.lowStock,
      percentage: stockPercentages.lowStock,
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
      progressColor: 'bg-orange-500',
    },
    {
      label: 'Out of Stock',
      value: data.outOfStock,
      percentage: stockPercentages.outOfStock,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      progressColor: 'bg-red-500',
    },
  ];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Status</CardTitle>
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="font-semibold">{formatCurrency(data.inventoryValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Stock</span>
            <span className="font-semibold">{data.totalStock.toLocaleString('pl-PL')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Products</span>
            <span className="font-semibold">{data.totalProducts}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          {stockItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('p-1 rounded', item.bgColor)}>
                      <Icon className={cn('h-3 w-3', item.color)} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <Progress
                  value={item.percentage}
                  className={cn('h-2', `[&>div]:${item.progressColor}`)}
                />
              </div>
            );
          })}
        </div>

        {data.lowStock > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {data.lowStock} products need restocking
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}