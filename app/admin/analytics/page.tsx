import { BarChart3 } from 'lucide-react';
import {
  getAnalyticsOverview,
  getTopProducts,
  getCustomerInsights,
  getInventoryStatus,
  getOrderStatusBreakdown,
  getProductCategoryDistribution,
  getCustomerOrderFrequency,
} from '@/lib/actions/admin-analytics-actions';
import { AnalyticsOverviewCards } from '@/components/admin/analytics/analytics-overview-cards';
import { TopProductsTable } from '@/components/admin/analytics/top-products-table';
import { CustomerInsightsChart } from '@/components/admin/analytics/customer-insights-chart';
import { InventoryStatusCard } from '@/components/admin/analytics/inventory-status-card';
import { OrderStatusChart } from '@/components/admin/analytics/order-status-chart';
import { ProductPerformanceChart } from '@/components/admin/analytics/product-performance-chart';
import { CustomerFrequencyChart } from '@/components/admin/analytics/customer-frequency-chart';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [
    overview,
    topProducts,
    customerInsights,
    inventoryStatus,
    orderStatusData,
    categoryDistribution,
    customerFrequency,
  ] = await Promise.all([
    getAnalyticsOverview(),
    getTopProducts(5),
    getCustomerInsights(),
    getInventoryStatus(),
    getOrderStatusBreakdown(),
    getProductCategoryDistribution(),
    getCustomerOrderFrequency(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your store performance
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <AnalyticsOverviewCards data={overview} />

      {/* Order and Product Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrderStatusChart data={orderStatusData} />
        <ProductPerformanceChart data={categoryDistribution} />
      </div>

      {/* Customer Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerInsightsChart data={customerInsights} />
        <CustomerFrequencyChart data={customerFrequency} />
      </div>

      {/* Inventory and Top Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryStatusCard data={inventoryStatus} />
        <div className="lg:row-span-1">
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </div>
  );
}