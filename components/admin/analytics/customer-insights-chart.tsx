'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

interface CustomerInsightsChartProps {
  data: {
    newCustomersThisMonth: number;
    growthRate: number;
    topCustomers: Array<{
      id: string;
      name: string;
      email: string;
      totalSpent: number;
      orderCount: number;
    }>;
    customerGrowth: Array<{
      month: string;
      count: number;
    }>;
  };
}

export function CustomerInsightsChart({ data }: CustomerInsightsChartProps) {
  const isPositive = data.growthRate > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { month: string } }> }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-medium">{data.payload.month}</p>
          <div className="mt-2">
            <p className="text-sm">
              <span className="text-muted-foreground">New Customers:</span>{' '}
              <span className="font-medium">{data.value}</span>
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
          <CardTitle>Customer Insights</CardTitle>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{data.newCustomersThisMonth}</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
        </div>
        {data.growthRate !== 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div
              className={`flex items-center gap-0.5 ${
                isPositive
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              <span className="text-sm font-medium">
                {Math.abs(data.growthRate).toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.customerGrowth.length > 0 && (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart
                data={data.customerGrowth}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {data.topCustomers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Top Customers</h4>
              <div className="space-y-2">
                {data.topCustomers.slice(0, 3).map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.orderCount} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}