import type { TrustCenterSnapshotResponse } from '@lovedate/api';
import { captureMessage } from '@/lib/observability';
import { increment } from '@/lib/metrics';

/**
 * Lightweight server-side cache for trust snapshots.
 * - Uses Upstash Redis when UPSTASH_REDIS_REST_URL is configured.
 * - Falls back to an in-memory Map (process-local) otherwise.
 *
 * Purpose: allow "stale-while-revalidate" behavior so the UI can render
 * when the upstream identity service is temporarily unavailable.
 */

const CACHE_PREFIX = 'trust:snapshot:';
const DEFAULT_TTL = 60 * 5; // 5 minutes

type CachedValue = { value: TrustCenterSnapshotResponse; expiresAt: number };

const memoryCache = new Map<string, CachedValue>();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function isUpstashConfigured() {
  return typeof process.env.UPSTASH_REDIS_REST_URL === 'string' &&
    process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
    typeof process.env.UPSTASH_REDIS_REST_TOKEN === 'string' &&
    process.env.UPSTASH_REDIS_REST_TOKEN.length > 0;
}

async function getFromUpstash(key: string): Promise<TrustCenterSnapshotResponse | null> {
  try {
    // import lazily so browser bundles don't include Upstash
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const raw = await redis.get(key);
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw) as TrustCenterSnapshotResponse;
    } catch (err) {
      console.warn('[trust-cache] upstash parse failed', (err as any)?.message ?? String(err));
      return null;
    }
  } catch (err) {
    console.warn('[trust-cache] upstash read failed', (err as any)?.message ?? String(err));
    increment('trust.cache.upstash.read_failed', []);
    try {
      captureMessage('trust-cache.upstash.read_failed', { key, error: (err as any)?.message ?? String(err) });
    } catch (captureError) {
      console.warn('[trust-cache] failed to capture upstash read error', captureError);
    }
    return null;
  }
}

async function setToUpstash(key: string, value: TrustCenterSnapshotResponse, ttl = DEFAULT_TTL) {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.set(key, JSON.stringify(value), { ex: ttl });
    increment('trust.cache.upstash.write', []);
  } catch (err) {
    console.warn('[trust-cache] upstash write failed', (err as any)?.message ?? String(err));
    increment('trust.cache.upstash.write_failed', []);
    try {
      captureMessage('trust-cache.upstash.write_failed', { key, error: (err as any)?.message ?? String(err) });
    } catch (captureError) {
      console.warn('[trust-cache] failed to capture upstash write error', captureError);
    }
  }
}

export async function getCachedSnapshot(userId: string): Promise<TrustCenterSnapshotResponse | null> {
  const key = `${CACHE_PREFIX}${userId}`;
  if (await isUpstashConfigured()) {
    const result = await getFromUpstash(key);
    increment('trust.cache.upstash.read', []);
    if (result) {
      increment('trust.cache.hit', []);
    } else {
      increment('trust.cache.miss', []);
    }
    return result;
  }

  // memory cache hit/miss tracking
  const entry = memoryCache.get(key);
  if (!entry) {
    increment('trust.cache.miss', []);
    return null;
  }
  if (entry.expiresAt < nowSeconds()) {
    memoryCache.delete(key);
    increment('trust.cache.miss', []);
    return null;
  }
  increment('trust.cache.hit', []);
  return entry.value;
}

export async function setCachedSnapshot(
  userId: string,
  snapshot: TrustCenterSnapshotResponse,
  ttlSeconds = DEFAULT_TTL
) {
  const key = `${CACHE_PREFIX}${userId}`;
  if (await isUpstashConfigured()) {
    await setToUpstash(key, snapshot, ttlSeconds);
    return;
  }

  memoryCache.set(key, { value: snapshot, expiresAt: nowSeconds() + ttlSeconds });
}

export async function isCacheAvailable(): Promise<boolean> {
  return (await isUpstashConfigured()) || true; // memory cache always available
}

// Log configuration at module load so operators can quickly verify runtime behavior
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.info('[trust-cache] Upstash Redis configured — using remote cache for trust snapshots');
} else {
  console.info('[trust-cache] Upstash Redis NOT configured — using in-memory fallback cache for trust snapshots');
}
