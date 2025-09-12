import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryDetails, getProductsByCategory } from '@/lib/actions/category-actions';
import { getWishlistProductIds } from '@/lib/actions/wishlist-actions';
import { ProductList } from '@/components/products/product-list';
import { Button } from '@/components/ui/button';
import PaginationWrapper from '@/components/ui/pagination-wrapper';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryDetails = await getCategoryDetails(slug);
  
  if (!categoryDetails) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${categoryDetails.name} Products`,
    description: `Browse ${categoryDetails.productCount} products in ${categoryDetails.name} category`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const categoryDetails = await getCategoryDetails(slug);
  
  if (!categoryDetails) {
    notFound();
  }

  const { products, totalPages } = await getProductsByCategory(
    categoryDetails.name, 
    currentPage
  );
  const wishlistProductIds = await getWishlistProductIds();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryDetails.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryDetails.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {categoryDetails.productCount} {categoryDetails.productCount === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This category doesn&apos;t have any products yet
            </p>
            <Button asChild className="mt-4">
              <Link href="/categories">Browse Other Categories</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ProductList 
            products={products} 
            wishlistProductIds={wishlistProductIds}
          />
          
          {/* Pagination */}
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/categories/${slug}`}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
}