import { cn } from '@/lib/utils';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductPrice({
  price,
  originalPrice,
  currency = '$',
  className,
  size = 'md',
}: ProductPriceProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold', sizeClasses[size])}>
        {currency}{price.toFixed(2)}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn(
            'text-muted-foreground line-through',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {currency}{originalPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}