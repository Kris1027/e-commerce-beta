export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-primary"></div>
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-square rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="aspect-square rounded-lg bg-muted animate-pulse" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-6 w-1/2 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 rounded bg-muted animate-pulse" />
          <div className="h-4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 flex-1 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 rounded bg-muted animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded bg-muted animate-pulse" />
      ))}
    </div>
  )
}