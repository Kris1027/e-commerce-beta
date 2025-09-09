'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-10 w-10 text-destructive"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong!
        </h1>
        <p className="max-w-[600px] text-muted-foreground">
          We apologize for the inconvenience. An unexpected error has occurred.
          Please try again or contact support if the problem persists.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Go to Home
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && error.message && (
        <details className="mt-4 max-w-[600px] rounded-lg border bg-muted/50 p-4 text-left">
          <summary className="cursor-pointer text-sm font-medium">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 overflow-auto text-xs">
            <code>{error.message}</code>
          </pre>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          )}
        </details>
      )}
    </div>
  )
}