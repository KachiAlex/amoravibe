import { NextResponse } from 'next/server';
import { preflight, withCors } from '@/lib/cors';

// Allow larger request bodies (photos embedded as data URLs) to flow through the proxy without
// Next.js rejecting them before we can forward them to the identity service.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};

const DEFAULT_UPSTREAM = 'http://localhost:4001/api/v1';
const upstreamBase = (process.env.TRUST_API_PROXY_TARGET || DEFAULT_UPSTREAM).replace(/\/$/, '');

async function proxy(request: Request, params: { path?: string[] }) {
  const search = new URL(request.url).search;
  const path = params.path?.length ? `/${params.path.join('/')}` : '';
  const targetUrl = `${upstreamBase}${path}${search}`;

  const init: RequestInit = {
    method: request.method,
    headers: filterHeaders(request.headers),
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    return withCors(
      request,
      new NextResponse(response.body, {
        status: response.status,
        headers: filterHeaders(response.headers),
      }),
      { methods: ALLOWED_METHODS }
    );
  } catch (error) {
    console.error('Trust API proxy error', error);
    return withCors(
      request,
      NextResponse.json({ message: 'Unable to reach Trust API gateway' }, { status: 502 }),
      { methods: ALLOWED_METHODS }
    );
  }
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

function filterHeaders(headers: Headers | HeadersInit) {
  const result = new Headers(headers);
  result.delete('content-length');
  result.delete('content-encoding');
  result.delete('connection');
  return result;
}

export async function GET(request: Request, context: { params: { path?: string[] } }) {
  return proxy(request, context.params);
}

export async function POST(request: Request, context: { params: { path?: string[] } }) {
  return proxy(request, context.params);
}

export async function PUT(request: Request, context: { params: { path?: string[] } }) {
  return proxy(request, context.params);
}

export async function PATCH(request: Request, context: { params: { path?: string[] } }) {
  return proxy(request, context.params);
}

export async function DELETE(request: Request, context: { params: { path?: string[] } }) {
  return proxy(request, context.params);
}

export async function OPTIONS(request: Request) {
  return preflight(request, ALLOWED_METHODS);
}
