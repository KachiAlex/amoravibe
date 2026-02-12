import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTrustApiBase } from '@/lib/trust-upstream';

const upstreamBase = resolveTrustApiBase();

/**
 * Proxy all /api/trust/* requests to the upstream trust/identity API
 * Handles nested paths like /api/trust/onboarding, /api/trust/onboarding/status, etc.
 */
async function handler(request: NextRequest) {
  try {
    // Extract the full path after /api/trust and include query params
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search;

    // Remove /api/trust prefix to get the API path
    const path = pathname.replace(/^\/api\/trust/, '');
    const url = `${upstreamBase}${path}${search}`;

    console.info(`[Trust API Proxy] ${request.method} ${path} -> ${url}`);

    // Build headers, excluding host to avoid conflicts
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Add auth header if available
    if (process.env.TRUST_API_KEY) {
      headers['x-api-key'] = process.env.TRUST_API_KEY;
    }

    // Determine the method
    const method = request.method;

    // Build request body for POST/PATCH/PUT
    let body: string | undefined;
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      body = await request.text();
    }

    // Forward the request to the upstream API
    const upstreamResponse = await fetch(url, {
      method,
      headers,
      body,
    });

    // Read response body
    const responseBody = await upstreamResponse.text();

    // Log response status
    console.info(`[Trust API Proxy] ${request.method} ${path} <- ${upstreamResponse.status}`);

    // Forward the response
    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Trust API Proxy] Error:', error);
    return NextResponse.json({ message: 'Failed to reach trust service' }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
