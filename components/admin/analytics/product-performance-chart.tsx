'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package } from 'lucide-react';

interface ProductPerformanceChartProps {
  data: Array<{
    category: string;
    productCount: number;
    averagePrice: number;
    totalStock: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        category: string;
        productCount: number;
        averagePrice: number;
        totalStock: number;
      }
    }>
  }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-medium">{data.category}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Products:</span>{' '}
              <span className="font-medium">{data.productCount}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Avg Price:</span>{' '}
              <span className="font-medium">{formatCurrency(data.averagePrice)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Total Stock:</span>{' '}
              <span className="font-medium">{data.totalStock}</span>
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
          <CardTitle>Product Category Distribution</CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="category"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="productCount" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}