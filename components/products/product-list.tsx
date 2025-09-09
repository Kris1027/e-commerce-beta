import { Product } from '@/types/product';
import { ProductCard } from './product-card';
import { cn } from '@/lib/utils';

interface ProductListProps {
  products: Product[];
  className?: string;
  columns?: 2 | 3 | 4 | 5;
}

export function ProductList({ 
  products, 
  className,
  columns = 4 
}: ProductListProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {products.map((product, index) => (
        <ProductCard 
          key={product.id || `${product.slug}-${index}`} 
          product={product} 
        />
      ))}
    </div>
  );
}