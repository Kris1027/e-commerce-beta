import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/orders"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Orders</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wishlist</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Link>

        <Link
          href="/profile"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile</p>
              <p className="text-lg">Manage</p>
            </div>
          </div>
        </Link>

        <Link
          href="/addresses"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Addresses</p>
              <p className="text-lg">Manage</p>
            </div>
          </div>
        </Link>
      </div>

      {session.user.role === 'admin' && (
        <div className="mt-8 p-6 rounded-lg border bg-primary/5">
          <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium transition-colors"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground text-center py-8">
            You haven&apos;t placed any orders yet.
          </p>
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}