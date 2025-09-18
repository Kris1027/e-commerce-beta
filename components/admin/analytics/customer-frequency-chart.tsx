'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { UserCheck } from 'lucide-react';

interface CustomerFrequencyChartProps {
  data: Array<{
    range: string;
    count: number;
  }>;
}

export function CustomerFrequencyChart({ data }: CustomerFrequencyChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        range: string;
        count: number;
      }
    }>
  }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0';

      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-medium">{data.range}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Customers:</span>{' '}
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
            <CardTitle>Customer Order Frequency</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Customer segmentation by order count
            </p>
          </div>
          <div className="p-2 bg-green-500/10 rounded-lg">
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="range"
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
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.map((item) => {
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
            return (
              <div
                key={item.range}
                className="p-3 rounded-lg bg-muted/50"
              >
                <p className="text-sm font-medium">{item.range}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold">{item.count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}