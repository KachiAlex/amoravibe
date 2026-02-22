import { NextResponse } from 'next/server';

export async function GET() {
  const isUpstashUrlSet = !!process.env.UPSTASH_REDIS_REST_URL;
  const isUpstashTokenSet = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  const isTrustApiSet = !!(process.env.NEXT_PUBLIC_TRUST_API_URL || process.env.TRUST_API_PROXY_TARGET);
  const isSentrySet = !!process.env.SENTRY_DSN;

  let upstashReachable = false;
  if (isUpstashUrlSet && isUpstashTokenSet) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      // ping to verify connectivity
      await redis.ping();
      upstashReachable = true;
    } catch (err) {
      console.warn('[check-env] failed to reach Upstash', (err as any)?.message ?? String(err));
    }
  }

  return NextResponse.json({ isUpstashUrlSet, isUpstashTokenSet, isTrustApiSet, isSentrySet, upstashReachable });
}
