'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/use-role';

export function AdminSection() {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Admin Panel Link for Admin Users */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-6 py-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-red-600 dark:text-red-400">Access Admin Panel</span>
        </Link>
      </div>

      {/* Admin Access */}
      <div className="mt-8 p-6 rounded-lg border bg-primary/5">
        <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
        <Button asChild>
          <Link href="/admin">
            Go to Admin Panel
          </Link>
        </Button>
      </div>
    </>
  );
}