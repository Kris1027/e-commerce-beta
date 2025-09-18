import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface TopProductsTableProps {
  products: Array<{
    id: string;
    name: string;
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
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
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
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
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
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(product.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">
                  {product.totalQuantity} sold · {product.orderCount} orders
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}