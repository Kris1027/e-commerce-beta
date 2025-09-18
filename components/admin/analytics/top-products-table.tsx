import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface TopProductsTableProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    image: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    stock: number;
  }> | null;
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No product data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Mobile: Rank and image in a row, Desktop: keep as is */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Product info - mobile layout */}
                <div className="flex-1 min-w-0 sm:hidden">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-medium line-clamp-1 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-xs max-w-[100px]">
                      <span className="truncate">{product.category}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product info - desktop layout */}
              <div className="hidden sm:block flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium truncate hover:underline"
                  >
                    {product.name}
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs max-w-[120px]">
                    <span className="truncate">{product.category}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(product.price)}
                  </span>
                  {product.stock <= 10 && (
                    <Badge
                      variant={product.stock <= 5 ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      Low stock: {product.stock}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats section - responsive layout */}
              <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end sm:justify-start pl-11 sm:pl-0">
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-sm sm:text-base">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    <span className="block sm:inline">{product.totalQuantity} sold</span>
                    <span className="hidden sm:inline"> · </span>
                    <span className="block sm:inline">{product.orderCount} orders</span>
                  </p>
                </div>

                {/* Stock badge for mobile */}
                {product.stock <= 10 && (
                  <Badge
                    variant={product.stock <= 5 ? 'destructive' : 'outline'}
                    className="text-xs sm:hidden"
                  >
                    Stock: {product.stock}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}