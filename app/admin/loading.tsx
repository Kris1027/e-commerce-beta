import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="p-0">
            {/* Table Header */}
            <div className="flex items-center border-b px-4 py-3 bg-muted/50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center border-b px-4 py-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex-1">
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}