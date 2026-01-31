// src/app/api/check-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    isUpstashUrlSet: !!process.env.UPSTASH_REDIS_REST_URL,
    isApiUrlSet: !!process.env.NEXT_PUBLIC_API_URL,
    // Don't expose the token in the response
  });
}
