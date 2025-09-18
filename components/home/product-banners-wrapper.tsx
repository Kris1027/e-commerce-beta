import { Suspense } from 'react';
import { getProductsWithBanners } from '@/lib/actions/product-actions';
import { ProductBannersClient } from './product-banners';
import { ProductBannersSkeleton } from './product-banners-skeleton';

async function ProductBannersServer() {
  const bannerProducts = await getProductsWithBanners();

  if (bannerProducts.length === 0) {
    return null;
  }

  // Filter and validate banner products at runtime for type safety
  const validBannerProducts = bannerProducts
    .filter((product): product is typeof product & { banner: string } =>
      typeof product.banner === 'string' && product.banner.length > 0
    )
    .map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      banner: product.banner,
      price: product.price,
      category: product.category,
    }));

  if (validBannerProducts.length === 0) {
    return null;
  }

  return <ProductBannersClient bannerProducts={validBannerProducts} />;
}

export function ProductBanners() {
  return (
    <Suspense fallback={<ProductBannersSkeleton />}>
      <ProductBannersServer />
    </Suspense>
  );
}