export default function CheckoutLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="ml-2 h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <div className="h-12 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-12 flex-1 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}