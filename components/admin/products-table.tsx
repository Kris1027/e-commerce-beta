'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
import { cn, formatCurrency, copyToClipboard } from '@/lib/utils';
import { AdminProductsResult, ProductStatistics } from '@/lib/actions/admin-product-actions';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import {
  Package,
  AlertCircle,
  Star,
  MoreVertical,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Copy,
  Check,
  ImageOff,
  DollarSign,
  Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ProductsTableProps {
  data: AdminProductsResult;
  statistics: ProductStatistics;
  categories: string[];
}

export function ProductsTable({ data, statistics, categories }: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
      params.set('page', '1');
    } else {
      params.delete('search');
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
      params.set('page', '1');
    } else {
      params.delete(key);
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleCopyId = async (id: string) => {
    await copyToClipboard(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'destructive', icon: AlertCircle };
    } else if (stock <= 10) {
      return { label: 'Low Stock', color: 'warning', icon: AlertCircle };
    } else {
      return { label: 'In Stock', color: 'default', icon: Check };
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.categoriesCount} categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Box className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inStock}</div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking soon
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(statistics.averagePrice)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search products by name, slug, or brand..."
                value={searchParams.get('search') || ''}
                onValueChange={handleSearch}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={searchParams.get('category') || 'all'}
                onValueChange={(value) => handleFilter('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={searchParams.get('stock') || 'all'}
                onValueChange={(value) => handleFilter('stock', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={searchParams.get('featured') || 'all'}
                onValueChange={(value) => handleFilter('featured', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="not_featured">Not Featured</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={searchParams.get('sort') || 'newest'}
                onValueChange={handleSort}
              >
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                  <SelectItem value="stock_asc">Stock (Low-High)</SelectItem>
                  <SelectItem value="stock_desc">Stock (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No products found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const StockIcon = stockStatus.icon;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="relative w-16 h-16">
                            {product.images && product.images.length > 0 && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                <ImageOff className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.brand || 'No brand'}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleCopyId(product.id)}
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                                  >
                                    {copiedId === product.id ? (
                                      <>
                                        <Check className="h-3 w-3" />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        {product.id.substring(0, 8)}...
                                      </>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to copy ID</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatCurrency(product.price)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StockIcon className={cn(
                              "h-4 w-4",
                              stockStatus.color === 'destructive' && "text-destructive",
                              stockStatus.color === 'warning' && "text-amber-600 dark:text-amber-400"
                            )} />
                            <span className={cn(
                              stockStatus.color === 'destructive' && "text-destructive",
                              stockStatus.color === 'warning' && "text-amber-600 dark:text-amber-400"
                            )}>
                              {product.stock}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{Number(product.rating).toFixed(1)}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {product.isFeatured && (
                              <Badge variant="secondary" className="w-fit">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge
                              variant={stockStatus.color === 'warning' ? 'secondary' : stockStatus.color as 'default' | 'destructive'}
                              className={cn(
                                "w-fit",
                                stockStatus.color === 'warning' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              )}
                            >
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(`/products/${product.slug}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Product
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4">
              <PaginationWrapper
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                baseUrl="/admin/products"
                preserveParams={true}
                showFirstLast={true}
                showPageInfo={true}
                totalItems={data.totalProducts}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}