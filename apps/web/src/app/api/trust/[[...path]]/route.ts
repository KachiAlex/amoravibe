import { NextResponse } from 'next/server';

const DEFAULT_UPSTREAM = 'http://localhost:3001';
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
    return new NextResponse(response.body, {
      status: response.status,
      headers: filterHeaders(response.headers),
    });
  } catch (error) {
    console.error('Trust API proxy error', error);
    return NextResponse.json({ message: 'Unable to reach Trust API gateway' }, { status: 502 });
  }
}

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
