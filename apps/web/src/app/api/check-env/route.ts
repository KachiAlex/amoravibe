import { NextResponse } from 'next/server';

export async function GET() {
  const isUpstashUrlSet = !!process.env.UPSTASH_REDIS_REST_URL;
  const isUpstashTokenSet = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  const isTrustApiSet = !!(process.env.NEXT_PUBLIC_TRUST_API_URL || process.env.TRUST_API_PROXY_TARGET);

  return NextResponse.json({ isUpstashUrlSet, isUpstashTokenSet, isTrustApiSet });
}
