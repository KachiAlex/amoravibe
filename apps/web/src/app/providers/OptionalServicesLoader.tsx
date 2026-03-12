'use client';

import { useEffect } from 'react';

/**
 * Optional Services Loader
 * Lazy-loads non-critical libraries (Sentry, Analytics) after page hydration
 * to avoid blocking initial render and LCP
 */
export function OptionalServicesLoader() {
  useEffect(() => {
    // Load Sentry after initial render (error tracking, not critical for UX)
    const loadSentry = () => {
      import('@sentry/node')
        .then((Sentry) => {
          if (typeof window !== 'undefined' && !window.__SENTRY_INITIALIZED) {
            Sentry.init({
              dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
              environment: process.env.NODE_ENV,
              integrations: [],
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            });
            (window as any).__SENTRY_INITIALIZED = true;
          }
        })
        .catch(console.error);
    };

    // Load analytics after LCP (engagement tracking, non-essential)
    const loadAnalytics = () => {
      // Google Analytics initialization would go here
      // Only load if user has consented to analytics
      if (typeof window !== 'undefined' && localStorage.getItem('analytics-consent') === 'true') {
        // Analytics code
      }
    };

    // Use requestIdleCallback for low priority loading, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadSentry();
        loadAnalytics();
      });
    } else {
      // Fallback: load after 3 seconds (after expected LCP)
      setTimeout(() => {
        loadSentry();
loadAnalytics();
      }, 3000);
    }
  }, []);

  return null;
}
