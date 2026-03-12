/**
 * Web Vitals Tracking Module
 * Collects and reports Core Web Vitals metrics
 * References: https://web.dev/vitals/
 */

export interface WebVital {
  name: 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'FID' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
}

// Thresholds for Core Web Vitals (as of 2024)
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // unitless
  TTFB: { good: 600, poor: 1800 }, // milliseconds
  FID: { good: 100, poor: 300 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
};

/**
 * Determine rating based on metric value and thresholds
 */
export function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'needs-improvement';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Core Web Vitals using web-vitals library
 */
export async function trackWebVitals(
  onMetric?: (metric: WebVital) => void | Promise<void>
) {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import web-vitals to avoid blocking critical path
    const { getCLS, getFCP, getLCP, getTTFB } = await import('web-vitals');

    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const handleMetric = async (name: string, metric: any) => {
      const vital: WebVital = {
        name,
        value: metric.value,
        rating: getRating(name, metric.value),
        delta: metric.delta || 0,
        id: metric.id,
        url: pageUrl,
        timestamp: Date.now(),
      };

      // Log to console
      console.log(`[Web Vitals] ${name}:`, {
        value: `${vital.value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`,
        rating: vital.rating,
        delta: vital.delta,
      });

      // Send to callback
      if (onMetric) {
        try {
          await onMetric(vital);
        } catch (error) {
          console.error('Error in Web Vitals callback:', error);
        }
      }
    };

    // Collect metrics
    getCLS((metric) => handleMetric('CLS', metric));
    getFCP((metric) => handleMetric('FCP', metric));
    getLCP((metric) => handleMetric('LCP', metric));
    getTTFB((metric) => handleMetric('TTFB', metric));
  } catch (error) {
    console.error('Failed to track Web Vitals:', error);
  }
}

/**
 * Send Web Vitals to analytics backend
 */
export async function sendWebVitalToAnalytics(metric: WebVital): Promise<void> {
  if (!navigator.sendBeacon && typeof fetch === 'undefined') {
    return;
  }

  const body = JSON.stringify({
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    page_url: metric.url,
    timestamp: new Date(metric.timestamp).toISOString(),
    user_agent: navigator.userAgent,
  });

  try {
    if (navigator.sendBeacon) {
      // Use sendBeacon for reliability (won't be blocked even if page unloads)
      navigator.sendBeacon('/api/metrics', body);
    } else {
      // Fallback to fetch with keepalive for browsers without sendBeacon
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send Web Vital to analytics:', error);
  }
}

/**
 * Format metric for display
 */
export function formatMetric(metric: WebVital): string {
  const unit = metric.name === 'CLS' ? '' : 'ms';
  const value = metric.name === 'CLS'
    ? metric.value.toFixed(3)
    : metric.value.toFixed(0);
  return `${value}${unit}`;
}

/**
 * Get color for rating (for UI display)
 */
export function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#0CCE6B'; // Green
    case 'needs-improvement':
      return '#FFA400'; // Amber
    case 'poor':
      return '#FF4E42'; // Red
  }
}
