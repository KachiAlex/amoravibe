'use client';

import { useEffect } from 'react';
import { trackWebVitals, sendWebVitalToAnalytics } from '@/lib/web-vitals';

/**
 * Web Vitals Reporter Component
 * Tracks and reports Core Web Vitals metrics
 * Loads after hydration to avoid blocking critical render
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Load Web Vitals tracking after hydration
    const startTracking = async () => {
      // Only send to analytics in production
      const shouldSendAnalytics = process.env.NODE_ENV === 'production';

      await trackWebVitals(async (metric) => {
        // Always log locally
        console.log('[Web Vitals Report]', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: metric.url,
        });

        // Send to analytics in production
        if (shouldSendAnalytics) {
          // Check if user has consented to analytics
          const analyticsConsent = localStorage.getItem('analytics-consent');
          if (analyticsConsent === 'true') {
            await sendWebVitalToAnalytics(metric);
          }
        }
      });
    };

    // Use requestIdleCallback to avoid blocking user interactions
    if ('requestIdleCallback' in window) {
      requestIdleCallback(startTracking);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(startTracking, 2000);
    }
  }, []);

  return null;
}
