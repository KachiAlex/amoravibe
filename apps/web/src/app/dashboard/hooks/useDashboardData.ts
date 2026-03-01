import type { DashboardData } from '../types';
import { resolveUserId } from '@/lib/auth-user';
import { fetchDashboardSnapshot } from '@/lib/dashboard-service';
import { headers } from 'next/headers';

const CACHE_TTL_SECONDS = 60; // short-lived to keep dashboard fresh
type CacheEntry = { data: DashboardData; expiresAt: number };

const dashboardCache = new Map<string, CacheEntry>();

function getCacheKey(userId: string | null) {
  return userId ? `dashboard:${userId}` : 'dashboard:guest';
}

function readCache(key: string): DashboardData | null {
  const entry = dashboardCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    dashboardCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: DashboardData) {
  dashboardCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 });
}

async function getRequestOrigin() {
  const hdrs = await headers();
  const forwardedProto = hdrs.get('x-forwarded-proto');
  const forwardedHost = hdrs.get('x-forwarded-host');
  const host = hdrs.get('host');
  const base = forwardedHost ?? host;
  if (!base) return null;
  return `${forwardedProto ?? 'https'}://${base}`;
}

async function fetchDashboardViaApi(): Promise<DashboardData | null> {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? (await getRequestOrigin()) ?? 'http://localhost:4000';
    const res = await fetch(`${origin}/api/dashboard`, {
      cache: 'no-store',
      headers: { 'x-dashboard-fetch': 'server' },
    });
    if (!res.ok) return null;
    return (await res.json()) as DashboardData;
  } catch (err) {
    console.warn('[useDashboardData] failed to fetch via api', err);
    return null;
  }
}

// Server-safe data loader for dashboard content.
export async function getDashboardData(): Promise<DashboardData> {
  const userId = await resolveUserId();
  const cacheKey = getCacheKey(userId);
  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const apiSnapshot = await fetchDashboardViaApi();
  const snapshot = apiSnapshot ?? (await fetchDashboardSnapshot(userId ?? null));
  writeCache(cacheKey, snapshot);
  return snapshot;
}
