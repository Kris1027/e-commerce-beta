'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UseNavigationGuardOptions {
  shouldBlock: () => boolean;
  onBlock?: (url?: string) => void;
  message?: string;
}

/**
 * Hook to prevent navigation when there are unsaved changes.
 *
 * Features:
 * - Intercepts browser navigation (back/forward, refresh, tab close)
 * - Intercepts Next.js client-side navigation
 * - Shows browser confirmation dialog for unload events
 * - Calls custom handler for internal navigation
 *
 * Limitations:
 * - Modern browsers show generic messages for beforeunload (security feature)
 * - Cannot prevent programmatic navigation (router.push() calls)
 * - Dialog appearance varies by browser
 *
 * @example
 * ```tsx
 * useNavigationGuard({
 *   shouldBlock: () => hasUnsavedChanges,
 *   onBlock: (url) => setShowConfirmDialog(true),
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
  const lastPathnameRef = useRef(pathname);

  // Browser navigation guard (back button, closing tab, refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlock()) {
        return undefined;
      }

      e.preventDefault();

      // Modern browsers ignore custom messages for security reasons and show a generic message.
      // Setting returnValue is still required to trigger the dialog in all browsers:
      // - Chrome 119+: Shows generic message, ignores custom text
      // - Firefox 44+: Shows generic message, ignores custom text
      // - Safari 9.1+: Shows generic message, ignores custom text
      // - Edge: Shows generic message, ignores custom text
      // The custom message is kept for older browsers and documentation purposes.
      e.returnValue = message;

      // Some legacy browsers may use the return value
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock, message]);

  // Track pathname changes
  useEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Intercept link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || !(target instanceof HTMLAnchorElement)) {
        return;
      }

      // Check if it's an internal navigation
      const href = target.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) {
        return;
      }

      // Check if we should block
      if (shouldBlock()) {
        e.preventDefault();
        e.stopPropagation();

        if (onBlock) {
          onBlock(href);
        }
      }
    };

    // Add event listener with capture to intercept before Next.js
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [shouldBlock, onBlock]);

  // Intercept browser back/forward buttons
  const isBlockingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (shouldBlock() && !isBlockingRef.current) {
        isBlockingRef.current = true;

        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);

        // Call the onBlock handler
        if (onBlock) {
          onBlock('back');
        }

        // Reset blocking flag after the event completes
        Promise.resolve().then(() => {
          isBlockingRef.current = false;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, onBlock]);
}