import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Star, Shield, Truck, RefreshCw } from 'lucide-react'
import { getProductBySlug } from '@/lib/actions/product-actions'
import { ProductImageGallery } from '@/components/products/product-image-gallery'
import { AddToCart } from '@/components/products/add-to-cart'
import { ProductPrice } from '@/components/products/product-price'
import { formatNumber } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const rating = Number(product.rating)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href="/products"
          className="hover:text-foreground transition-colors"
        >
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-foreground transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Brand */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">
              {rating.toFixed(1)} ({formatNumber(product.numReviews)} reviews)
            </span>
          </div>

          {/* Price */}
          <div>
            <ProductPrice price={product.price} size="lg" />
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <h3 className="mb-2 text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Section */}
          <div className="border-t pt-6">
            <AddToCart
              productId={product.id}
              productName={product.name}
              price={product.price}
              stock={product.stock}
              slug={product.slug}
              image={product.images[0] || '/placeholder.svg'}
            />
          </div>

          {/* Features */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Secure Transaction</p>
                <p className="text-muted-foreground text-xs">
                  Your payment information is safe
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-muted-foreground text-xs">
                  Free shipping on orders over 100 zł
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-muted-foreground text-xs">
                  30-day return policy
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="mb-3 text-lg font-semibold">Product Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">SKU:</dt>
                <dd className="font-medium">
                  {product.id.slice(-8).toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category:</dt>
                <dd className="font-medium">{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Brand:</dt>
                <dd className="font-medium">{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Stock:</dt>
                <dd className="font-medium">{product.stock} units</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
