import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersLoading() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Table Header */}
              <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/50">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-4 w-[280px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[130px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>

              {/* Table Rows */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b">
                  <Skeleton className="h-6 w-[140px]" />
                  <div className="flex items-center gap-2 w-[280px]">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[130px]" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 px-4 py-4 border-t">
            <Skeleton className="h-4 w-48 mx-auto" />
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-24" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9" />
              ))}
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}