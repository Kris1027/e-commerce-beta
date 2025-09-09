import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl">
          404
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Page Not Found
        </h2>
        <p className="max-w-[600px] text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          The page might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Back to Home
        </Link>
        <Link
          href="/products"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Browse Products
        </Link>
      </div>
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          Popular categories
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link
            href="/categories/electronics"
            className="text-sm text-primary hover:underline"
          >
            Electronics
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/categories/clothing"
            className="text-sm text-primary hover:underline"
          >
            Clothing
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/categories/accessories"
            className="text-sm text-primary hover:underline"
          >
            Accessories
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/deals"
            className="text-sm text-primary hover:underline"
          >
            Deals
          </Link>
        </div>
      </div>
    </div>
  )
}