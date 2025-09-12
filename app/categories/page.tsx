import { Metadata } from 'next';
import { getCategories } from '@/lib/actions/category-actions';
import CategoryGrid from '@/components/categories/category-grid';

export const metadata: Metadata = {
  title: 'Shop by Category',
  description: 'Browse our product categories',
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop by Category</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our {categories.length} product categories
        </p>
      </div>

      <CategoryGrid categories={categories} />
    </div>
  );
}