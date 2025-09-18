import { ProductBanners } from '@/components/home/product-banners-wrapper';
import { FeaturedProducts } from '@/components/home/featured-products';
import { ProductList } from '@/components/products/product-list';
import { getFeaturedProducts, getNewArrivals } from '@/lib/actions/product-actions';
import { getWishlistProductIds } from '@/lib/actions/wishlist-actions';
import { storeConfig } from '@/config/store.config';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [featuredProducts, newArrivals, wishlistProductIds] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getWishlistProductIds(),
  ]);

  const { homepage } = storeConfig;

  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductBanners />
        </div>
      </section>

      {homepage.sections.featuredProducts && (
        <FeaturedProducts 
          products={featuredProducts}
          title={homepage.sectionTitles.featured}
          wishlistProductIds={wishlistProductIds}
        />
      )}

      {homepage.sections.trustBadges && (
        <section className="bg-muted/50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {storeConfig.trustBadges.map((badge) => {
                const IconComponent = Icons[badge.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                return (
                  <div key={badge.title} className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                    </div>
                    <h3 className="mb-2 font-semibold">{badge.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {homepage.sections.newArrivals && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {homepage.sectionTitles.newArrivals}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Be the first to get our latest {storeConfig.product.itemName.plural}
                </p>
              </div>
              <Link
                href="/products"
                className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Shop All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ProductList products={newArrivals} wishlistProductIds={wishlistProductIds} />
          </div>
        </section>
      )}

      {homepage.sections.newsletter && (
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold">
              {homepage.sectionTitles.newsletter}
            </h2>
            <p className="mb-8 text-primary-foreground/90">
              Get the latest updates and exclusive offers
            </p>
            <form className="mx-auto flex max-w-md gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground"
                required
              />
              <button
                type="submit"
                className="rounded-md bg-background px-6 py-2 font-medium text-foreground transition-colors hover:bg-background/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
