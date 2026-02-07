/* eslint-disable @typescript-eslint/no-unused-vars */
// Mock API client for local onboarding with backend fallback
// Real API calls enabled when NEXT_PUBLIC_ENABLE_REAL_* env vars are set

import { BACKEND_CONFIG, getBackendUrl } from './backend-config';
import { createLovedateApi } from '@lovedate/api';

// Provide a flexible mock API client for local development.
// Use a Proxy so any missing method resolves to a no-op async function,
// preventing TypeScript/webpack errors during the Next.js build.
let exported: any = null;

if (BACKEND_CONFIG.USE_REAL_BACKEND && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
  try {
    // Instantiate a real API client pointed at the identity service base URL
    const baseUrl = BACKEND_CONFIG.IDENTITY_SERVICE_URL.replace(/\/$/, '');
    exported = createLovedateApi({ baseUrl });
  } catch (err) {
    // Fall back to proxy/mock implementation on error
    // eslint-disable-next-line no-console
    console.error('Failed to create real lovedateApi client, falling back to mock:', err);
  }
}

if (!exported) {
  exported = new Proxy(
    {
      submitOnboarding: async (data: any) => ({ success: true }),
      checkOnboarding: async (userId: string) => ({ isOnboarded: true }),
      getSession: async () => ({}),
      postSession: async (data: any) => ({ success: true }),
      discoverCards: async () => ({ cards: [] }),
      likeCard: async (id: string) => ({ success: true }),
      getEngagementDashboard: async () => ({
        receivedLikes: [],
        sentLikes: [],
        notificationPreferences: [],
        premiumPerks: [],
        safetyResources: [],
        settingsShortcuts: [],
        discoverFilters: [],
      }),
      /* existing stub implementations follow unchanged... */
      fetchEngagementDashboard: async (userId: string) => {
        if (BACKEND_CONFIG.ENABLE_REAL_ENGAGEMENT && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
          try {
            const url = getBackendUrl(`/engagement/dashboard/${userId}`);
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) return await res.json();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch engagement from identity service', e);
          }
        }

        return {
          receivedLikes: [],
          sentLikes: [],
          notificationPreferences: [],
          premiumPerks: [],
          safetyResources: [],
          settingsShortcuts: [],
          discoverFilters: [],
        };
      },
      getTrustSnapshot: async () => ({
        devices: [],
        user: { id: 'local-user', displayName: 'You', isVerified: false, trustScore: 0, photos: [] },
      }),
      fetchTrustSnapshot: async (userId: string) => {
        if (BACKEND_CONFIG.ENABLE_REAL_TRUST && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
          try {
            const url = getBackendUrl(`/trust/center/${userId}`);
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) return await res.json();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch trust snapshot', e);
          }
        }
        return { devices: [], user: { id: userId || 'local-user', displayName: 'You', isVerified: false, trustScore: 0, photos: [] } };
      },
      fetchDiscoverFeed: async (opts: { userId?: string; mode?: string; limit?: number }) => {
        try {
          const params = new URLSearchParams();
          if (opts?.mode) params.set('mode', opts.mode);
          if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
          if (opts?.userId) {
            // Use Next API proxy for SSR server environment to preserve cookies/origin
            const baseUrl =
              typeof window === 'undefined'
                ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                : '';
            const url = `${baseUrl}/api/dashboard/discover?${params.toString()}&userId=${encodeURIComponent(opts.userId)}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to fetch discover feed: ${res.status}`);
            return await res.json();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch discover feed', error);
        }
        return { hero: null, featured: [], grid: [], filters: [], mode: opts?.mode ?? 'default', total: 0, generatedAt: new Date().toISOString() };
      },
      likeUser: async (payload: any) => {
        try {
          const res = await fetch('/api/user/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error(`likeUser ${res.status}`);
          return await res.json();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to like user', err);
          return { success: false };
        }
      },
      nudgeLike: async (likeId: string) => {
        try {
          const res = await fetch('/api/user/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'nudge', likeId }) });
          if (!res.ok) throw new Error(`nudge ${res.status}`);
          return await res.json();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to nudge like', err);
          return { success: false };
        }
      },
      fetchMessagingThreads: async (userId: string, limit?: number) => {
        try {
          const params = new URLSearchParams();
          if (typeof limit === 'number') params.set('limit', String(limit));
          if (typeof window === 'undefined') {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
            const url = `${baseUrl}/api/dashboard/messages?userId=${encodeURIComponent(userId)}&${params.toString()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to fetch messaging threads: ${res.status}`);
            const json = await res.json();
            return json.threads || [];
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch messaging threads', error);
        }
        return [];
      },
      fetchDiscoverFeedPaginated: async (opts: any) => ({ items: [], total: 0 }),
      requestVerification: async (data: any) => ({ success: true }),
      requestReverification: async (data: any) => ({ success: true }),
      completeVerification: async (id: string) => ({ success: true }),
      fetchVerification: async (id: string) => null,
      sendMessage: async (data: any) => ({ success: true }),
      getMessagingThreads: async () => ({ threads: [] }),
      listCommunities: async () => ({ communities: [], total: 0 }),
      getCommunityDetail: async () => ({ community: null }),
      joinCommunity: async () => ({ status: 'denied', eligibility: { allowed: false, reasons: [] } }),
      leaveCommunity: async () => ({ success: true }),
      listCommunityPosts: async () => ({ posts: [], nextCursor: null }),
      createCommunityPost: async () => ({ success: true, postId: 'local-post' }),
      reportCommunityPost: async () => ({ success: true, reportId: 'local-report' }),
      getCommunityMembers: async () => ({ members: [], total: 0 }),
      evaluateCommunityEligibility: async () => ({ eligibility: {} }),
    },
    {
      get(target, prop) {
        if (prop in target) return (target as any)[prop];
        return async (..._args: any[]) => ({});
      },
    }
  );
}

export const lovedateApi: any = exported;

const normalizeBaseUrl = (value: string) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }
  return `https://${value}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    const upstream =
      process.env.TRUST_API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_TRUST_API_URL ||
      'http://localhost:4001/api/v1';
    return normalizeBaseUrl(upstream);
  }

  const clientTarget = process.env.NEXT_PUBLIC_TRUST_API_URL;
  if (!clientTarget) {
    return '/api/trust';
  }

  const normalized = normalizeBaseUrl(clientTarget);

  try {
    const currentOrigin = window.location.origin;
    const targetOrigin = normalized.startsWith('/') ? currentOrigin : new URL(normalized).origin;
    if (targetOrigin !== currentOrigin) {
      return '/api/trust';
    }
  } catch {
    return '/api/trust';
  }

  return normalized;
};

// Already exported above as mock
