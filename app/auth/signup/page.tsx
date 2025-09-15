'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpAction } from '@/lib/actions/auth-actions';
import { mergeAnonymousCart, getCart } from '@/lib/actions/cart-actions';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { buildAuthUrl } from '@/lib/utils';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants/auth';
import { useCartStore } from '@/lib/store/cart-store';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Creating account...' : 'Sign Up'}
    </Button>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUpAction, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || DEFAULT_AUTH_REDIRECT;
  const syncWithServer = useCartStore((state) => state.syncWithServer);

  useEffect(() => {
    if (state?.success) {
      toast.success('Account created successfully! Welcome aboard!');

      // Merge the anonymous cart and then get the updated cart
      Promise.all([
        mergeAnonymousCart(),
        new Promise(resolve => setTimeout(resolve, 100)) // Small delay to ensure merge completes
      ]).then(async () => {
        const updatedCart = await getCart();
        syncWithServer(updatedCart);
        router.replace(callbackUrl);
      });
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, callbackUrl, syncWithServer]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link
              href={buildAuthUrl('/auth/signin', callbackUrl)}
              className="font-medium text-primary hover:text-primary/80"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={formAction}>
          <Input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1"
                placeholder="Enter your full name"
              />
            </div>

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
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Create a password (min 8 characters)"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agree-terms"
              name="agree-terms"
              required
            />
            <Label htmlFor="agree-terms" className="text-sm font-normal cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80">
                Terms and Conditions
              </Link>
            </Label>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}