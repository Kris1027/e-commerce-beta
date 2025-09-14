'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SignInButton } from '@/components/auth/sign-in-button';
import { Button } from '@/components/ui/button';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error occurred trying to sign in with OAuth.';
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account.';
      case 'EmailCreateAccount':
        return 'Could not create email account.';
      case 'Callback':
        return 'Error occurred during callback.';
      case 'OAuthAccountNotLinked':
        return 'Email is already linked to another account.';
      case 'EmailSignin':
        return 'Check your email for the sign in link.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <svg
              className="h-6 w-6 text-destructive"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Authentication Error</h2>
          <p className="mt-2 text-muted-foreground">
            {getErrorMessage()}
          </p>
        </div>

        <div className="space-y-3">
          <SignInButton className="w-full" preserveCallbackUrl={false}>
            Try Again
          </SignInButton>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              Go to Homepage
            </Link>
          </Button>
        </div>

        {error && (
          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Error code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}