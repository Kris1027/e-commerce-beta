'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { cn, formatDateTime, formatCurrency, copyToClipboard } from '@/lib/utils';
import { AdminOrdersResult, OrderSummary, updateAdminOrderStatus, deleteOrder } from '@/lib/actions/admin-order-actions';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  MoreVertical,
  ArrowUpDown,
  Eye,
  Trash2,
  CreditCard,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrdersTableProps {
  data: AdminOrdersResult;
  summary: OrderSummary;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

export function OrdersTable({ data, summary }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || 'all';
  const currentPayment = searchParams.get('payment') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentStatus !== 'all') count++;
    if (currentPayment !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
        params.delete('page');
      } else {
        params.delete('search');
        params.delete('page');
      }
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('sort', value);
      params.delete('page');
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      router.push('/admin/orders');
    });
  };

  const handleStatusCardClick = (status: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (status === 'all') {
        params.delete('status');
      } else {
        params.set('status', status);
      }
      params.delete('page');
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const result = await updateAdminOrderStatus(orderId, newStatus);
    if (result.success) {
      toast.success('Order status updated successfully');
      router.refresh();
    } else {
      toast.error((result as { success: false; message?: string }).message || 'Failed to update order status');
    }
  };

  const handleCopyId = async (orderId: string) => {
    const success = await copyToClipboard(orderId);
    if (success) {
      setCopiedId(orderId);
      toast.success('Order ID copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Failed to copy ID');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeletingOrderId(orderToDelete);
    const result = await deleteOrder(orderToDelete);

    if (result.success) {
      toast.success('Order deleted successfully');
      router.refresh();
    } else {
      toast.error((result as { success: false; message?: string }).message || 'Failed to delete order');
    }

    setDeletingOrderId(null);
    setOrderToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card
          className={cn(
            "border-l-4 border-l-gray-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'all' && "ring-2 ring-gray-500"
          )}
          onClick={() => handleStatusCardClick('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {summary.todaysOrders} today
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'pending' && "ring-2 ring-yellow-500"
          )}
          onClick={() => handleStatusCardClick('pending')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'processing' && "ring-2 ring-blue-500"
          )}
          onClick={() => handleStatusCardClick('processing')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.processingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Being prepared
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-l-4 border-l-purple-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'shipped' && "ring-2 ring-purple-500"
          )}
          onClick={() => handleStatusCardClick('shipped')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.shippedOrders}</div>
            <p className="text-xs text-muted-foreground">
              In transit
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'delivered' && "ring-2 ring-green-500"
          )}
          onClick={() => handleStatusCardClick('delivered')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            currentStatus === 'cancelled' && "ring-2 ring-red-500"
          )}
          onClick={() => handleStatusCardClick('cancelled')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.cancelledOrders}</div>
            <p className="text-xs text-muted-foreground">
              Terminated
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 max-w-sm">
                <SearchInput
                  placeholder="Search by order ID, customer..."
                  value={currentSearch}
                  onValueChange={handleSearchChange}
                  className="w-full"
                />
              </div>

              <Select value={currentStatus} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentPayment} onValueChange={(value) => handleFilterChange('payment', value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Value</SelectItem>
                  <SelectItem value="lowest">Lowest Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="h-10 px-3"
                disabled={isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Found {data.totalOrders} orders</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <CreditCard className="h-3 w-3" />
                {summary.paidOrders} Paid
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {summary.unpaidOrders} Unpaid
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isPending ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TooltipProvider>
                    {data.orders.map((order) => {
                      const upperStatus = order.status.toUpperCase() as keyof typeof statusIcons;
                      const StatusIcon = statusIcons[upperStatus] || Clock;
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(order.id);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded transition-all cursor-pointer",
                                    "hover:bg-primary/10 hover:text-primary",
                                    copiedId === order.id && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  )}
                                >
                                  {copiedId === order.id ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 opacity-70" />
                                      <span>{order.id.slice(0, 6)}...</span>
                                    </>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{order.id}</p>
                                <p className="text-xs text-muted-foreground mt-1">Click to copy full ID</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.user?.name || 'Guest'}</span>
                            <span className="text-xs text-muted-foreground">
                              {order.user?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn('gap-1', statusColors[upperStatus] || statusColors.PENDING)}>
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.totalItems}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(order.totalPrice))}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm">
                                {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Created: {formatDateTime(order.createdAt).dateTime}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={deletingOrderId === order.id}>
                                {deletingOrderId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Update Status
                              </DropdownMenuLabel>
                              {order.status !== 'PENDING' && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PENDING')}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Pending
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'PROCESSING' && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}>
                                  <Package className="h-4 w-4 mr-2" />
                                  Mark as Processing
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'SHIPPED' && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}>
                                  <Truck className="h-4 w-4 mr-2" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'DELIVERED' && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'CANCELLED' && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Mark as Cancelled
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setOrderToDelete(order.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        </TableRow>
                      );
                    })}
                  </TooltipProvider>
                </TableBody>
              </Table>
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="px-6 py-4 border-t">
              <PaginationWrapper
                totalPages={data.totalPages}
                currentPage={data.currentPage}
                baseUrl="/admin/orders"
                preserveParams
                showFirstLast
                showPageInfo
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}