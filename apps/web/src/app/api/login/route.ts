import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { preflight, withCors } from '@/lib/cors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

// Mock server API - not used with local onboarding
function normalizeCredentials(payload: { email?: unknown; phone?: unknown; password?: unknown }) {
  const email =
    typeof payload.email === 'string' && payload.email.trim().length > 0
      ? payload.email.trim().toLowerCase()
      : undefined;
  const phone =
    typeof payload.phone === 'string' && payload.phone.trim().length > 0
      ? payload.phone.trim()
      : undefined;
  const password = typeof payload.password === 'string' ? payload.password : undefined;
  return { email, phone, password };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password } = normalizeCredentials(body ?? {});

    if ((!email && !phone) || !password) {
      return withCors(
        request,
        NextResponse.json({ message: 'Provide an email/phone and password.' }, { status: 400 }),
        { methods: ['POST', 'OPTIONS'] }
      );
    }

    // Mock login response
    const login = { user: { id: 'user-' + Math.random().toString(36).slice(2, 11) } };
    setSession({ userId: login.user.id });
    return withCors(request, NextResponse.json(login), { methods: ['POST', 'OPTIONS'] });
  } catch (error) {
    console.error('Login error', error);
    return withCors(
      request,
      NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }),
      { methods: ['POST', 'OPTIONS'] }
    );
  }
}

export async function OPTIONS(request: Request) {
  return preflight(request, ['POST']);
}
