'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ShoppingBag } from 'lucide-react';

interface OrderStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    displayName: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        status: string;
        count: number;
        displayName: string;
      }
    }>
  }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const data = payload[0].payload;
      const percentage = ((data.count / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-medium">{data.displayName}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Orders:</span>{' '}
              <span className="font-medium">{data.count}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Percentage:</span>{' '}
              <span className="font-medium">{percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total orders: {total}
            </p>
          </div>
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="displayName"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS[item.status] || '#94a3b8' }}
                />
                <span className="text-sm capitalize">{item.status}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}