import {
  getProductsForAdmin,
  getProductStatistics,
  type ProductFilterCategory,
  type ProductFilterStock,
  type ProductFilterFeatured,
  type ProductSortBy
} from '@/lib/actions/admin-product-actions';
import { getAllCategories } from '@/lib/actions/product-actions';
import { ProductsTable } from '@/components/admin/products-table';
import { Package } from 'lucide-react';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    stock?: string;
    featured?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const categoryFilter = (params.category || 'all') as ProductFilterCategory;
  const stockFilter = (params.stock || 'all') as ProductFilterStock;
  const featuredFilter = (params.featured || 'all') as ProductFilterFeatured;
  const sortBy = (params.sort || 'newest') as ProductSortBy;

  const [data, statistics, categoriesResult] = await Promise.all([
    getProductsForAdmin(page, search, categoryFilter, stockFilter, featuredFilter, sortBy),
    getProductStatistics(),
    getAllCategories(),
  ]);

  const categories = categoriesResult.success
    ? categoriesResult.data.map(c => c.category)
    : [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl">
            <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Products
            </h1>
            <p className="text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>
        </div>
      </div>

      <ProductsTable data={data} statistics={statistics} categories={categories} />
    </>
  );
}