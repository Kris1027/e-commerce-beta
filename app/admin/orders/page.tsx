import {
  getOrdersForAdmin,
  getOrderSummary,
  type OrderFilterStatus,
  type OrderFilterPayment,
  type OrderSortBy
} from '@/lib/actions/admin-order-actions';
import { OrdersTable } from '@/components/admin/orders-table';
import { ShoppingCart } from 'lucide-react';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    payment?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const statusFilter = (params.status || 'all') as OrderFilterStatus;
  const paymentFilter = (params.payment || 'all') as OrderFilterPayment;
  const sortBy = (params.sort || 'newest') as OrderSortBy;

  const [data, summary] = await Promise.all([
    getOrdersForAdmin(page, search, statusFilter, paymentFilter, sortBy),
    getOrderSummary(),
  ]);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Orders
            </h1>
            <p className="text-muted-foreground">
              Manage orders and track order status
            </p>
          </div>
        </div>
      </div>

      <OrdersTable data={data} summary={summary} />
    </>
  );
}