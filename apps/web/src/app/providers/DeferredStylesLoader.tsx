'use client';

import { useEffect } from 'react';

/**
 * Deferred Styles Loader
 * Loads non-critical CSS after React hydration to avoid blocking initial render
 * Critical CSS is inline, deferred CSS loads after LCP
 */
export function DeferredStylesLoader() {
  useEffect(() => {
    // Load deferred stylesheet after hydration
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/_next/static/css/globals-deferred.css';
    
    // Use requestIdleCallback for low-priority loading (fallback to setTimeout)
    const loadStyles = () => {
      document.head.appendChild(link);
      document.documentElement.classList.add('deferred-styles-loaded');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadStyles);
    } else {
      // Fallback: load after 2.5 seconds (after expected LCP)
      setTimeout(loadStyles, 2500);
    }
  }, []);

  return null;
}
