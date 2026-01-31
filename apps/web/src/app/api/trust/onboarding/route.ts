import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

/**
 * Proxy for POST /api/trust/onboarding
 * Forwards to upstream identity service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const url = `${upstreamBase}/onboarding`;

    console.info('[Trust API Proxy] POST /onboarding ->', url);

    const upstreamResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.TRUST_API_KEY && { 'x-api-key': process.env.TRUST_API_KEY }),
      },
      body,
    });

    const responseBody = await upstreamResponse.text();

    console.info('[Trust API Proxy] POST /onboarding <-', upstreamResponse.status);

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Trust API Proxy] Onboarding error:', error);
    return NextResponse.json({ message: 'Failed to reach onboarding service' }, { status: 503 });
  }
}

/**
 * Proxy for GET /api/trust/onboarding/status
 */
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.search;
    const url = `${upstreamBase}/onboarding/status${search}`;

    console.info('[Trust API Proxy] GET /onboarding/status ->', url);

    const upstreamResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.TRUST_API_KEY && { 'x-api-key': process.env.TRUST_API_KEY }),
      },
    });

    const responseBody = await upstreamResponse.text();

    console.info('[Trust API Proxy] GET /onboarding/status <-', upstreamResponse.status);

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Trust API Proxy] Onboarding status error:', error);
    return NextResponse.json({ message: 'Failed to reach onboarding service' }, { status: 503 });
  }
}
