export type AnalyticsPayload = Record<string, unknown>;

const isDev = process.env.NODE_ENV !== 'production';

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  try {
    if (typeof window !== 'undefined' && (window as any)?.gtag) {
      (window as any).gtag('event', event, payload);
    } else if (typeof window !== 'undefined' && (window as any)?.analytics?.track) {
      (window as any).analytics.track(event, payload);
    } else if (isDev) {
      console.debug(`[analytics] ${event}`, payload);
    }
  } catch (err) {
    if (isDev) {
      console.warn('[analytics] failed to track event', event, err);
    }
  }
}
