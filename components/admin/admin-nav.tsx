'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  BarChart,
} from 'lucide-react';
import { useState } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tags,
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);


  return (
    <aside
      className={cn(
        'relative flex flex-col bg-card/50 backdrop-blur border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="text-xl font-bold">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <SignOutButton
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground',
            isCollapsed && 'justify-center px-0'
          )}
          showText={!isCollapsed}
          iconClassName="h-5 w-5"
        />
      </div>
    </aside>
  );
}