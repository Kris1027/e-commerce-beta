import Link from 'next/link';
import { Grid3x3, Package, Tag, TrendingUp, AlertCircle } from 'lucide-react';
import { getAllCategories } from '@/lib/actions/product-actions';

async function getCategories() {
  const result = await getAllCategories();

  if (!result.success) {
    return { categories: [], error: result.error };
  }

  const icons = [Grid3x3, Package, Tag, TrendingUp];
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
  
  const categories = result.data.map((item, index) => ({
    name: item.category,
    icon: icons[index % icons.length],
    description: `Browse our selection of ${item.category.toLowerCase()}`,
    productCount: item._count,
    href: `/products?category=${encodeURIComponent(item.category.toLowerCase().replace(/\s+/g, '-'))}`,
    color: colors[index % colors.length],
  }));

  return { categories, error: null };
}

export async function CategoriesSection() {
  const { categories, error } = await getCategories();
  
  // Show error state if there was an error
  if (error) {
    return (
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Don't render section if no categories
  if (categories.length === 0) return null;
  
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Browse our collections and find what you need
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`mb-4 inline-flex rounded-lg ${category.color} p-3 text-white`}>
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {category.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}