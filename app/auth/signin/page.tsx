'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInAction } from '@/lib/actions/auth-actions';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  );
}

export default function SignInPage() {
  const [state, formAction] = useActionState(signInAction, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    if (state?.success) {
      toast.success('Signed in successfully!');
      router.push(callbackUrl);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, callbackUrl]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link
              href={`/auth/signup${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="font-medium text-primary hover:text-primary/80"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={formAction}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                name="remember-me"
              />
              <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <SubmitButton />
        </form>

      </div>
    </div>
  );
}