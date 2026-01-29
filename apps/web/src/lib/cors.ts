import { NextResponse } from 'next/server';

const STATIC_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://amoravibe.vercel.app',
  process.env.NEXT_PUBLIC_SITE_URL,
  ...(process.env.CORS_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ?? []),
].filter(Boolean) as string[];

const DEFAULT_ALLOW_HEADERS = 'Content-Type, Authorization, X-Requested-With, Accept';
const DEFAULT_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

function resolveAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;

  try {
    const requestOrigin = new URL(request.url).origin;
    if (origin === requestOrigin) {
      return origin;
    }
  } catch {
    // Ignore URL parsing errors and fall back to static list checks.
  }

  if (STATIC_ALLOWED_ORIGINS.length === 0) {
    return origin;
  }

  return STATIC_ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function ensureVaryHeader(response: NextResponse) {
  const existing = response.headers.get('Vary');
  response.headers.set('Vary', existing ? `${existing}, Origin` : 'Origin');
}

export function withCors(
  request: Request,
  response: NextResponse,
  options?: { methods?: string[] }
) {
  const allowedOrigin = resolveAllowedOrigin(request);

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  const allowHeaders =
    request.headers.get('access-control-request-headers') ?? DEFAULT_ALLOW_HEADERS;
  response.headers.set('Access-Control-Allow-Headers', allowHeaders);
  const methods = options?.methods ?? DEFAULT_ALLOW_METHODS;
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));

  ensureVaryHeader(response);
  return response;
}

export function preflight(request: Request, methods?: string[]) {
  return withCors(
    request,
    new NextResponse(null, {
      status: 204,
    }),
    { methods }
  );
}
