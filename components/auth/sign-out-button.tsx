'use client';

import { useTransition } from 'react';
import { signOutAction } from '@/lib/actions/auth-actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface SignOutButtonProps {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
  showText?: boolean;
  iconClassName?: string;
  children?: React.ReactNode;
  asChild?: boolean;
  disabled?: boolean;
}

export function SignOutButton({
  className,
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  showText = true,
  iconClassName,
  children,
  asChild = false,
  disabled,
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOutAction();
        toast.success('Signed out successfully');
      } catch (error) {
        console.error('Sign out failed:', error);
        toast.error('Failed to sign out. Please try again.');
      }
    });
  };

  const content = children || (
    <>
      {showIcon && (
        <LogOut
          className={cn(
            'h-4 w-4 flex-shrink-0',
            showText && 'mr-2',
            iconClassName
          )}
        />
      )}
      {showText && (
        <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
      )}
    </>
  );

  if (asChild) {
    return (
      <form action={handleSignOut}>
        <button
          type="submit"
          disabled={disabled || isPending}
          className={cn(
            'flex w-full items-center rounded-sm px-2 py-1.5 text-sm',
            'hover:bg-accent hover:text-accent-foreground',
            'cursor-pointer transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          aria-label="Sign out"
        >
          {content}
        </button>
      </form>
    );
  }

  return (
    <form action={handleSignOut}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={disabled || isPending}
        className={cn('cursor-pointer', className)}
        aria-label="Sign out"
      >
        {content}
      </Button>
    </form>
  );
}