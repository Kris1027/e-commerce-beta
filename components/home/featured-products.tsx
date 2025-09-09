import { Product } from '@/types/product';
import { ProductList } from '@/components/products/product-list';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
}

export function FeaturedProducts({
  products,
  title = 'Featured Products',
  description = 'Check out our handpicked selection of premium products',
  showViewAll = true,
}: FeaturedProductsProps) {
  const featuredProducts = products.filter(product => product.isFeatured);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          </div>
          {showViewAll && (
            <Link
              href="/products"
              className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        <ProductList products={featuredProducts} />
      </div>
    </section>
  );
}