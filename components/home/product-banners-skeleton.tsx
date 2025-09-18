import { Skeleton } from '@/components/ui/skeleton';

export function ProductBannersSkeleton() {
  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/6] overflow-hidden rounded-lg">
        <Skeleton className="absolute inset-0" />
        <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 space-y-2 sm:space-y-4 max-w-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" />
          <Skeleton className="h-6 sm:h-8 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Skeleton className="h-1.5 w-8 rounded-full" />
        <Skeleton className="h-1.5 w-1.5 rounded-full" />
        <Skeleton className="h-1.5 w-1.5 rounded-full" />
      </div>
    </div>
  );
}