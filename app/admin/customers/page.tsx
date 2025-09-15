import { getUsersForAdmin } from '@/lib/actions/user-actions';
import { CustomersTable } from '@/components/admin/customers-table';
import { Users } from 'lucide-react';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';

  const data = await getUsersForAdmin(page, search);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Customers
            </h1>
            <p className="text-muted-foreground">
              Manage your customer base and view user details
            </p>
          </div>
        </div>
      </div>

      <CustomersTable data={data} />
    </div>
  );
}