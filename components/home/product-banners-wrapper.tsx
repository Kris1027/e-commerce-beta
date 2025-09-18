import { getProductsWithBanners } from '@/lib/actions/product-actions';
import { ProductBannersClient } from './product-banners';

export async function ProductBanners() {
  const bannerProducts = await getProductsWithBanners();

  if (bannerProducts.length === 0) {
    return null;
  }

  const validBannerProducts = bannerProducts.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    banner: product.banner as string,
    price: product.price,
    category: product.category,
  }));

  return <ProductBannersClient bannerProducts={validBannerProducts} />;
}