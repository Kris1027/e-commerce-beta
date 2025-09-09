import { cn } from '@/lib/utils';

interface ProductPriceProps {
  price: number | string;
  originalPrice?: number | string;
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

  const numPrice = Number(price);
  const numOriginalPrice = originalPrice ? Number(originalPrice) : undefined;
  
  const discount = numOriginalPrice && numOriginalPrice > numPrice
    ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
    : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold', sizeClasses[size])}>
        {currency}{numPrice.toFixed(2)}
      </span>
      {numOriginalPrice && numOriginalPrice > numPrice && (
        <>
          <span className={cn(
            'text-muted-foreground line-through',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {currency}{numOriginalPrice.toFixed(2)}
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