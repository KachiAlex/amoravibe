import { NextResponse } from 'next/server';
import { createLovedateApi } from '@lovedate/api';
import { setSession } from '@/lib/session';
import { preflight, withCors } from '@/lib/cors';

const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

// Log the resolved upstream base to help debug proxy targets during development
console.info('[Login route] upstreamBase =', upstreamBase);

const serverLovedateApi = createLovedateApi({
  baseUrl: upstreamBase,
  apiKey: process.env.TRUST_API_KEY,
});

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

    const login = await serverLovedateApi.login({ email, phone, password });
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
