'use client';

import { useEffect, useRef, useCallback, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface UseNavigationGuardOptions {
  shouldBlock: () => boolean;
  onBlock?: (url?: string) => void;
  message?: string;
}

/**
 * Hook to prevent navigation when there are unsaved changes.
 *
 * This implementation follows Next.js 15 best practices:
 * - Uses App Router navigation APIs
 * - Avoids direct history manipulation where possible
 * - Provides clean integration with Next.js routing
 *
 * Features:
 * - Intercepts browser navigation (back/forward, refresh, tab close)
 * - Intercepts Next.js client-side navigation through link clicks
 * - Shows browser confirmation dialog for unload events
 * - Calls custom handler for internal navigation
 *
 * @example
 * ```tsx
 * const { confirmNavigation } = useNavigationGuard({
 *   shouldBlock: () => hasUnsavedChanges,
 *   onBlock: (url) => {
 *     setBlockedUrl(url);
 *     setShowConfirmDialog(true);
 *   },
 *   message: 'You have unsaved changes'
 * });
 * ```
 */
export function useNavigationGuard({
  shouldBlock,
  onBlock,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseNavigationGuardOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const lastPathRef = useRef(pathname);
  const isAllowedNavigation = useRef(false);

  // Update last path when pathname changes
  useEffect(() => {
    if (!isAllowedNavigation.current) {
      lastPathRef.current = pathname;
    }
    isAllowedNavigation.current = false;
  }, [pathname]);

  // Handle browser unload events (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlock()) {
        return;
      }

      // Prevent the default behavior
      e.preventDefault();

      // Legacy support: some browsers still use returnValue
      // Modern browsers will show their own generic message
      const confirmationMessage = message;
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock, message]);

  // Intercept link clicks for client-side navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Skip if navigation is allowed
      if (isAllowedNavigation.current) {
        return;
      }

      // Find the closest anchor tag
      let element = e.target as HTMLElement | null;
      while (element && element.tagName !== 'A') {
        element = element.parentElement;
      }

      if (!element || !(element instanceof HTMLAnchorElement)) {
        return;
      }

      const href = element.getAttribute('href');

      // Skip external links, hash links, mailto, tel, etc.
      if (!href ||
          href.startsWith('http://') ||
          href.startsWith('https://') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:')) {
        return;
      }

      // Check if we should block navigation
      if (shouldBlock()) {
        e.preventDefault();
        e.stopPropagation();

        // Call the onBlock handler with the attempted URL
        if (onBlock) {
          onBlock(href);
        }
      }
    };

    // Use capture phase to intercept before Next.js handles the click
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [shouldBlock, onBlock]);

  // Handle browser back/forward navigation
  useEffect(() => {
    let initialUrl = window.location.href;

    const handlePopState = () => {
      // Skip if navigation is allowed
      if (isAllowedNavigation.current) {
        initialUrl = window.location.href;
        return;
      }

      if (shouldBlock()) {
        // Get the URL that was attempted
        const attemptedUrl = window.location.href;

        // Restore the previous URL
        window.history.replaceState(null, '', initialUrl);

        // Call the onBlock handler
        if (onBlock) {
          // Extract the pathname from the attempted URL
          try {
            const url = new URL(attemptedUrl);
            onBlock(url.pathname + url.search);
          } catch {
            onBlock('back');
          }
        }
      } else {
        // Update the stored URL if navigation wasn't blocked
        initialUrl = window.location.href;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, onBlock]);

  // Provide a method to programmatically navigate after confirmation
  const confirmNavigation = useCallback((url: string) => {
    isAllowedNavigation.current = true;
    startTransition(() => {
      router.push(url);
    });
  }, [router]);

  // Provide a method to programmatically navigate without blocking
  const navigateWithoutBlocking = useCallback((url: string) => {
    isAllowedNavigation.current = true;
    router.push(url);
  }, [router]);

  return {
    confirmNavigation,
    navigateWithoutBlocking,
    isPending,
    currentPath: pathname,
  };
}