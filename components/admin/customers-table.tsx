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
import { AdminUsersResult, deleteUser } from '@/lib/actions/user-actions';
import { UpdateUserModal } from '@/components/admin/update-user-modal';
import { UserRole } from '@prisma/client';
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
  TrendingUp,
  Trash2,
  AlertTriangle,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Users,
  Activity,
  DollarSign,
  Shield,
  X,
  Edit2
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
}

export function CustomersTable({ data }: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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
            <div className="text-3xl font-bold">{data.totalUsers}</div>
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
              {data.users.filter(u => u.role === 'admin').length}
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
              {data.users.filter(u => u.ordersCount > 0).length}
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
              {formatCurrency(data.users.reduce((sum, u) => sum + Number(u.totalSpent), 0).toString())}
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
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-10 cursor-text bg-background/50 border-muted-foreground/20 focus:bg-background transition-colors"
                  disabled={isPending}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isPending}
                size="default"
                className="gap-2"
              >
                <Search className="h-4 w-4" />
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
                  Reset
                </Button>
              )}
            </form>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Users</DropdownMenuItem>
                  <DropdownMenuItem>Customers Only</DropdownMenuItem>
                  <DropdownMenuItem>Admins Only</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Activity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>With Orders</DropdownMenuItem>
                  <DropdownMenuItem>Without Orders</DropdownMenuItem>
                  <DropdownMenuItem>High Value (&gt; 1000 zł)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                  <DropdownMenuItem>Most Orders</DropdownMenuItem>
                  <DropdownMenuItem>Highest Spent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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
                  <TableHead className="w-[80px]">Actions</TableHead>
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4" />
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
                              <DropdownMenuItem className="cursor-pointer">
                                <User className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                View Orders
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