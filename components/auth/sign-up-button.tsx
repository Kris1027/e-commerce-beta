'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAuthUrl } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface SignUpButtonProps {
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

export function SignUpButton({
  className,
  variant = 'default',
  size = 'default',
  showIcon = false,
  showText = true,
  iconClassName,
  children,
  asChild = false,
  preserveCallbackUrl = true,
}: SignUpButtonProps) {
  const searchParams = useSearchParams();
  const callbackUrl = preserveCallbackUrl ? searchParams.get('callbackUrl') || '' : '';
  const href = callbackUrl ? buildAuthUrl('/auth/signup', callbackUrl) : '/auth/signup';

  const content = children || (
    <>
      {showIcon && (
        <UserPlus
          className={cn(
            'h-4 w-4 flex-shrink-0',
            showText && 'mr-2',
            iconClassName
          )}
        />
      )}
      {showText && <span>Sign Up</span>}
    </>
  );

  if (asChild) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
          'bg-primary text-primary-foreground transition-colors hover:bg-primary/90',
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