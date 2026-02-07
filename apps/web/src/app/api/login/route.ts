import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { preflight, withCors } from '@/lib/cors';
import { BACKEND_CONFIG, getBackendUrl } from '@/lib/backend-config';

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

    if (BACKEND_CONFIG.USE_REAL_BACKEND) {
      try {
        // Call real identity service login
        const loginResponse = await fetch(getBackendUrl('/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, phone, password }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          await setSession({ userId: loginData.user.id });
          return withCors(request, NextResponse.json(loginData), { methods: ['POST', 'OPTIONS'] });
        } else {
          // If real backend fails, log and fall back to mock
          console.warn('Real backend login failed, falling back to mock login');
        }
      } catch (error) {
        console.warn('Real backend login error, falling back to mock login', error);
      }
    }

    // Mock login response (fallback)
    const login = { user: { id: 'user-' + Math.random().toString(36).slice(2, 11) } };
    await setSession({ userId: login.user.id });
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
