'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Shield } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { SignOutButton } from '@/components/auth/sign-out-button';

interface UserNavProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="hidden sm:inline-flex"
        aria-label="User menu"
      >
        <User className="h-5 w-5" />
      </Button>

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
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              href="/profile"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            
            <Link
              href="/orders"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              My Orders
            </Link>

            {user.role === UserRole.admin && (
              <>
                <div className="h-px bg-border" />
                <Link
                  href="/admin"
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer font-medium text-red-600"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </>
            )}
            
            <div className="h-px bg-border" />

            <SignOutButton asChild />
          </div>
        </>
      )}
    </div>
  );
}