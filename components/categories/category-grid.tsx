import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/validators';
import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No categories found</h2>
        <p className="text-center text-muted-foreground">
          Add products to see categories here
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group cursor-pointer"
        >
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm opacity-90">
                  {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}