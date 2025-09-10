'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOutAction } from '@/lib/actions/auth-actions';

interface UserNavProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
        aria-label="User menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-sm font-semibold">
              {user.name || user.email}
            </div>
            <div className="px-2 pb-1.5 text-xs text-muted-foreground">
              {user.email}
            </div>
            <div className="h-px bg-border" />
            
            <Link
              href="/dashboard"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              href="/profile"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            
            <Link
              href="/orders"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              My Orders
            </Link>

            {user.role === 'admin' && (
              <>
                <div className="h-px bg-border" />
                <Link
                  href="/admin"
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </Link>
              </>
            )}
            
            <div className="h-px bg-border" />
            
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Sign Out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}