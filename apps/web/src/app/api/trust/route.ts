import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

/**
 * Proxy all /api/trust/* requests to the upstream trust/identity API
 * This allows the client-side API client to use /api/trust as the baseUrl
 * and have requests forwarded to the backend service
 */
export async function handler(request: NextRequest) {
  try {
    // Extract the path after /api/trust
    const path = request.nextUrl.pathname.replace(/^\/api\/trust/, '');
    const query = request.nextUrl.search;
    const url = `${upstreamBase}${path}${query}`;

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

    // Forward the response
    const responseBody = await upstreamResponse.text();
    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: {
        'Content-Type': upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Trust API proxy error:', error);
    return NextResponse.json({ message: 'Failed to reach trust service' }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
