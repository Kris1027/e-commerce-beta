'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageWrapper({ children, className }: AdminPageWrapperProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={cn(
        'transition-opacity duration-150',
        isTransitioning ? 'opacity-0' : 'opacity-100',
        className
      )}
    >
      {children}
    </div>
  );
}