'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

const mainNavItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
]

const accountNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'My Profile' },
  { href: '/orders', label: 'Orders' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/cart', label: 'Cart' },
]

// Removed support nav items as these pages don't exist yet
// They can be added back when the pages are created

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Main Menu</h3>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground font-medium'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Account</h3>
            <div className="space-y-1">
              {accountNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground font-medium'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}