'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UseNavigationGuardOptions {
  shouldBlock: () => boolean;
  onBlock?: (url?: string) => void;
  message?: string;
}

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
      if (shouldBlock()) {
        e.preventDefault();
        // returnValue is deprecated but still needed for some browsers
        e.returnValue = message;
        return message;
      }
      return;
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
  useEffect(() => {
    let isBlocking = false;

    const handlePopState = () => {
      if (shouldBlock() && !isBlocking) {
        isBlocking = true;

        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);

        // Call the onBlock handler
        if (onBlock) {
          onBlock('back');
        }

        // Reset blocking flag
        setTimeout(() => {
          isBlocking = false;
        }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, onBlock]);
}