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
import { formatCurrency, copyToClipboard, cn, generatePaginationNumbers } from '@/lib/utils';
import { AdminUsersResult, deleteUser, CustomerStatistics } from '@/lib/actions/user-actions';
import { UpdateUserModal } from '@/components/admin/update-user-modal';
import { UserRole } from '@prisma/client';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  User,
  Heart,
  Copy,
  Check,
  Mail,
  Crown,
  ShoppingBag,
  Trash2,
  AlertTriangle,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Users,
  Activity,
  DollarSign,
  Shield,
  Edit2,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Loader2
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomersTableProps {
  data: AdminUsersResult;
  statistics: CustomerStatistics;
}

export function CustomersTable({ data, statistics }: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Get current filter values from URL
  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || 'all';
  const currentActivity = searchParams.get('activity') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
        params.delete('page'); // Reset to first page on new search
      } else {
        params.delete('search');
        params.delete('page');
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

  const handleFilterChange = (type: 'role' | 'activity' | 'sort', value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      // Remove page parameter to reset to page 1
      params.delete('page');

      // Handle filter value
      if (value === 'all' || (type === 'sort' && value === 'newest')) {
        params.delete(type);
      } else {
        params.set(type, value);
      }

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

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Customer Management</h2>
        <p className="text-muted-foreground">
          Manage your customer base and user accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              All registered users
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.adminUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System administrators
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/20 to-pink-500/20" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.activeBuyers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customers with orders
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(statistics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From all customers
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="w-full lg:max-w-md">
              <SearchInput
                value={currentSearch}
                onValueChange={handleSearchChange}
                placeholder="Search customers by name or email..."
                minChars={0}
                maxLength={50}
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    disabled={isPending}
                    className={cn(
                      "gap-2",
                      (currentRole !== 'all' || currentActivity !== 'all') && "border-primary"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                    Filters
                    {(currentRole !== 'all' || currentActivity !== 'all') && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        {[currentRole !== 'all' && 1, currentActivity !== 'all' && 1].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('role', 'all')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>All Users</span>
                      {currentRole === 'all' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('role', 'customers')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Customers Only</span>
                      {currentRole === 'customers' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('role', 'admins')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Admins Only</span>
                      {currentRole === 'admins' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Activity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('activity', 'all')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>All Activity</span>
                      {currentActivity === 'all' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('activity', 'with-orders')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>With Orders</span>
                      {currentActivity === 'with-orders' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('activity', 'without-orders')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Without Orders</span>
                      {currentActivity === 'without-orders' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('activity', 'high-value')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>High Value (&gt; 1000 zł)</span>
                      {currentActivity === 'high-value' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    disabled={isPending}
                    className={cn(
                      "gap-2",
                      currentSort !== 'newest' && "border-primary"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                    Sort
                    {currentSort !== 'newest' && (
                      <Badge variant="secondary" className="ml-1">
                        {currentSort === 'oldest' && 'Oldest'}
                        {currentSort === 'name-asc' && 'A-Z'}
                        {currentSort === 'name-desc' && 'Z-A'}
                        {currentSort === 'most-orders' && 'Orders'}
                        {currentSort === 'highest-spent' && 'Spent'}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'newest')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Newest First</span>
                      {currentSort === 'newest' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'oldest')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Oldest First</span>
                      {currentSort === 'oldest' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'name-asc')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Name (A-Z)</span>
                      {currentSort === 'name-asc' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'name-desc')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Name (Z-A)</span>
                      {currentSort === 'name-desc' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'most-orders')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Most Orders</span>
                      {currentSort === 'most-orders' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('sort', 'highest-spent')}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Highest Spent</span>
                      {currentSort === 'highest-spent' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden relative">
        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[10%] min-w-[80px]">ID</TableHead>
                  <TableHead className="w-[25%] min-w-[180px]">Customer</TableHead>
                  <TableHead className="w-[8%] min-w-[70px]">Role</TableHead>
                  <TableHead className="w-[10%] min-w-[90px]">Joined</TableHead>
                  <TableHead className="text-center w-[8%] min-w-[60px]">Orders</TableHead>
                  <TableHead className="text-center w-[8%] min-w-[60px]">Wishlist</TableHead>
                  <TableHead className="text-right w-[11%] min-w-[80px]">Spent</TableHead>
                  <TableHead className="w-[12%] min-w-[90px]">Last Order</TableHead>
                  <TableHead className="w-[8%] min-w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchParams.get('search')
                        ? 'No customers found matching your search'
                        : 'No customers yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TooltipProvider>
                    {data.users.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors h-12">
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyId(user.id);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded transition-all cursor-pointer",
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
                                    <span>{user.id.slice(0, 6)}...</span>
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
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {(user.name || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate text-sm">{user.name || 'Anonymous'}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
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
                              <div className="text-xs text-muted-foreground">
                                {user.formattedCreatedAt.dateOnly}
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
                          <span className={cn(
                            "text-sm font-medium",
                            Number(user.totalSpent) > 0 ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {formatCurrency(user.totalSpent)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-xs",
                            user.formattedLastOrderDate ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {user.formattedLastOrderDate?.dateOnly || "Never"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-muted"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <UpdateUserModal
                                user={{
                                  id: user.id,
                                  name: user.name || 'Anonymous',
                                  email: user.email || '',
                                  role: user.role as UserRole,
                                }}
                                onSuccess={() => {
                                  router.refresh();
                                  toast.success('User updated successfully');
                                }}
                                trigger={
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href={`/admin/customers/${user.id}`}>
                                  <User className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                    disabled={deletingUserId === user.id}
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                  <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-destructive" />
                                  Delete User Account
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="space-y-3">
                                    <p>Are you sure you want to delete this user?</p>
                                    <div className="bg-muted p-3 rounded-md space-y-1">
                                      <div className="font-medium">{user.name || 'Anonymous'}</div>
                                      <div className="text-sm text-muted-foreground">{user.email}</div>
                                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                                    </div>
                                    <p className="text-sm text-destructive font-medium">
                                      This action cannot be undone. All user data including wishlists and order history will be permanently deleted.
                                    </p>
                                    {user.ordersCount > 0 && (
                                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                        ⚠️ This user has {user.ordersCount} order(s). Make sure all active orders are completed or cancelled before deletion.
                                      </p>
                                    )}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <div className="flex flex-col gap-4 px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground text-center">
                Page {data.currentPage} of {data.totalPages} ({data.totalUsers} total customers)
              </div>
              <Pagination>
                <PaginationContent>
                  {/* First Page Button */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(1)}
                      disabled={data.currentPage === 1 || isPending}
                      className="h-9 w-9 cursor-pointer"
                      aria-label="Go to first page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {/* Previous Page Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(data.currentPage - 1)}
                      className={cn(
                        "cursor-pointer",
                        (data.currentPage === 1 || isPending) && "pointer-events-none opacity-50"
                      )}
                      aria-disabled={data.currentPage === 1 || isPending}
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {generatePaginationNumbers(data.currentPage, data.totalPages).map((page, index) => {
                    if (typeof page === 'string') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={`page-${page}`}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === data.currentPage}
                          className={cn(
                            "cursor-pointer",
                            isPending && "pointer-events-none opacity-50"
                          )}
                          aria-disabled={isPending}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Next Page Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(data.currentPage + 1)}
                      className={cn(
                        "cursor-pointer",
                        (!data.hasMore || isPending) && "pointer-events-none opacity-50"
                      )}
                      aria-disabled={!data.hasMore || isPending}
                    />
                  </PaginationItem>

                  {/* Last Page Button */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(data.totalPages)}
                      disabled={data.currentPage === data.totalPages || isPending}
                      className="h-9 w-9 cursor-pointer"
                      aria-label="Go to last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}