import { getProductsWithBanners } from '@/lib/actions/product-actions';
import { ProductBannersClient } from './product-banners';

export async function ProductBanners() {
  const bannerProducts = await getProductsWithBanners();

  // Filter out products without banners and ensure type safety
  const validBannerProducts = bannerProducts
    .filter((product): product is typeof product & { banner: string } =>
      product.banner !== null && product.banner !== undefined
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