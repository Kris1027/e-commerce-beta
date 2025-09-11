export default function CartLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="mt-4 flex justify-between">
                      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="mt-6 space-y-3">
              <div className="h-12 w-full animate-pulse rounded bg-muted" />
              <div className="h-12 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}