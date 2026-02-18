import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTrustApiBase } from '@/lib/trust-upstream';

const upstreamBase = resolveTrustApiBase();

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle /api/trust/* requests
  if (pathname.startsWith('/api/trust/')) {
    // Allow local mock mode to bypass upstream proxy (set TRUST_API_MOCK=1)
    if (process.env.TRUST_API_MOCK === '1' || process.env.TRUST_API_MOCK === 'true') {
      console.info('[Trust API Proxy] TRUST_API_MOCK enabled — skipping proxy to upstream');
      return NextResponse.next();
    }

    const path = pathname.replace(/^\/api\/trust/, '');
    const url = `${upstreamBase}${path}${request.nextUrl.search}`;

    console.info(`[Trust API Proxy] ${request.method} ${path} -> ${url}`);

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    if (process.env.TRUST_API_KEY) {
      headers['x-api-key'] = process.env.TRUST_API_KEY;
    }

    let body: string | undefined;
    if (['POST', 'PATCH', 'PUT'].includes(request.method)) {
      body = await request.text();
    }

    try {
      const upstreamResponse = await fetch(url, {
        method: request.method,
        headers,
        body,
      });

      const responseBody = await upstreamResponse.text();
      console.info(`[Trust API Proxy] ${request.method} ${path} <- ${upstreamResponse.status}`);

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/trust/:path*'],
};
