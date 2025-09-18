import { Suspense } from 'react';
import { getProductsWithBanners } from '@/lib/actions/product-actions';
import { ProductBannersClient } from './product-banners';
import { ProductBannersSkeleton } from './product-banners-skeleton';

async function ProductBannersServer() {
  const bannerProducts = await getProductsWithBanners();

  if (bannerProducts.length === 0) {
    return null;
  }

  // Map products directly since banner is guaranteed to be a string from the query
  const validBannerProducts = bannerProducts.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    banner: product.banner,
    price: product.price,
    category: product.category,
  }));

  return <ProductBannersClient bannerProducts={validBannerProducts} />;
}

export function ProductBanners() {
  return (
    <Suspense fallback={<ProductBannersSkeleton />}>
      <ProductBannersServer />
    </Suspense>
  );
}