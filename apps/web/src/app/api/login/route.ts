import { NextResponse } from 'next/server';
import { createLovedateApi } from '@lovedate/api';
import { setSession } from '@/lib/session';

const upstreamBase = (
  process.env.TRUST_API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_TRUST_API_URL ||
  'http://localhost:4001/api/v1'
).replace(/\/$/, '');

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
      return NextResponse.json(
        { message: 'Provide an email/phone and password.' },
        { status: 400 }
      );
    }

    const login = await serverLovedateApi.login({ email, phone, password });
    setSession({ userId: login.user.id });
    return NextResponse.json(login);
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
  }
}
