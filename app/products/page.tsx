import { ProductList } from '@/components/products/product-list';
import { getAllProducts } from '@/lib/actions/product-actions';

export default async function ProductsPage() {
  const { data: products } = await getAllProducts({ page: 1 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of high-quality products
        </p>
      </div>
      <ProductList products={products} />
    </div>
  );
}