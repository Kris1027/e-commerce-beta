'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { formatCurrency, copyToClipboard, cn } from '@/lib/utils';
import { AdminUsersResult } from '@/lib/actions/user-actions';
import {
  Search,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Mail,
  Crown,
  ShoppingBag,
  Clock,
  TrendingUp
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

interface CustomersTableProps {
  data: AdminUsersResult;
}

export function CustomersTable({ data }: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('search', searchTerm);
        params.set('page', '1'); // Reset to first page on new search
      } else {
        params.delete('search');
      }
      router.push(`/admin/customers?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      router.push(`/admin/customers?${params.toString()}`);
    });
  };

  const handleCopyId = async (userId: string) => {
    const success = await copyToClipboard(userId);
    if (success) {
      setCopiedId(userId);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Failed to copy ID');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalUsers > 0 ? `Page ${data.currentPage} of ${data.totalPages}` : 'No customers yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 cursor-pointer"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Search
            </Button>
            {searchParams.get('search') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  startTransition(() => {
                    router.push('/admin/customers');
                  });
                }}
                disabled={isPending}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px]">ID</TableHead>
                  <TableHead className="min-w-[200px]">Customer</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead className="w-[120px]">Joined</TableHead>
                  <TableHead className="text-center w-[100px]">Orders</TableHead>
                  <TableHead className="text-center w-[100px]">Wishlist</TableHead>
                  <TableHead className="text-right w-[130px]">Total Spent</TableHead>
                  <TableHead className="w-[120px]">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchParams.get('search')
                        ? 'No customers found matching your search'
                        : 'No customers yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TooltipProvider>
                    {data.users.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyId(user.id);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded-md transition-all cursor-pointer",
                                  "hover:bg-primary/10 hover:text-primary",
                                  copiedId === user.id && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                )}
                              >
                                {copiedId === user.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 opacity-70" />
                                    <span>{user.id.slice(0, 8)}...</span>
                                  </>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{user.id}</p>
                              <p className="text-xs text-muted-foreground mt-1">Click to copy full ID</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {(user.name || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name || 'Anonymous'}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className={cn(
                              "font-medium",
                              user.role === 'admin' && "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                            )}
                          >
                            {user.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{user.formattedCreatedAt.dateOnly}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Joined: {user.formattedCreatedAt.dateTime}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <div className={cn(
                                  "flex items-center justify-center gap-1.5 px-2 py-1 rounded-md",
                                  user.ordersCount > 0 && "bg-blue-50 dark:bg-blue-950/30"
                                )}>
                                  <ShoppingBag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                  <span className="font-medium">{user.ordersCount}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.ordersCount} total orders</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <div className={cn(
                                  "flex items-center justify-center gap-1.5 px-2 py-1 rounded-md",
                                  user.wishlistCount > 0 && "bg-pink-50 dark:bg-pink-950/30"
                                )}>
                                  <Heart className={cn(
                                    "h-3.5 w-3.5",
                                    user.wishlistCount > 0 ? "text-pink-600 dark:text-pink-400 fill-current" : "text-muted-foreground"
                                  )} />
                                  <span className="font-medium">{user.wishlistCount}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.wishlistCount} items in wishlist</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium",
                                Number(user.totalSpent) > 0 && "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                              )}>
                                {Number(user.totalSpent) > 1000 && <TrendingUp className="h-3.5 w-3.5" />}
                                {formatCurrency(user.totalSpent)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lifetime value: {formatCurrency(user.totalSpent)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {user.formattedLastOrderDate ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm font-medium">
                                  {user.formattedLastOrderDate.dateOnly}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Last order: {user.formattedLastOrderDate.dateTime}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No orders</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TooltipProvider>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm text-muted-foreground">
                Page {data.currentPage} of {data.totalPages} ({data.totalUsers} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  disabled={data.currentPage === 1 || isPending}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  disabled={!data.hasMore || isPending}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}