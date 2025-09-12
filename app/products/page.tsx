import { ProductList } from '@/components/products/product-list';
import { getAllProducts } from '@/lib/actions/product-actions';
import { getWishlistProductIds } from '@/lib/actions/wishlist-actions';
import PaginationWrapper from '@/components/ui/pagination-wrapper';

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { data: products, totalPages } = await getAllProducts({ page: currentPage });
  const wishlistProductIds = await getWishlistProductIds();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of high-quality products
        </p>
      </div>
      <ProductList products={products} wishlistProductIds={wishlistProductIds} />
      
      {/* Pagination */}
      <PaginationWrapper
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/products"
        className="mt-8"
      />
    </div>
  );
}