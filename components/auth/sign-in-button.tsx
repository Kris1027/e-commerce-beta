'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAuthUrl } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface SignInButtonProps {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
  showText?: boolean;
  iconClassName?: string;
  children?: React.ReactNode;
  asChild?: boolean;
  preserveCallbackUrl?: boolean;
}

export function SignInButton({
  className,
  variant = 'outline',
  size = 'default',
  showIcon = false,
  showText = true,
  iconClassName,
  children,
  asChild = false,
  preserveCallbackUrl = true,
}: SignInButtonProps) {
  const searchParams = useSearchParams();
  const callbackUrl = preserveCallbackUrl ? searchParams.get('callbackUrl') || '' : '';
  const href = callbackUrl ? buildAuthUrl('/auth/signin', callbackUrl) : '/auth/signin';

  const content = children || (
    <>
      {showIcon && (
        <LogIn
          className={cn(
            'h-4 w-4 flex-shrink-0',
            showText && 'mr-2',
            iconClassName
          )}
        />
      )}
      {showText && <span>Sign In</span>}
    </>
  );

  if (asChild) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          'cursor-pointer',
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('cursor-pointer', className)}
      asChild
    >
      <Link href={href}>
        {content}
      </Link>
    </Button>
  );
}