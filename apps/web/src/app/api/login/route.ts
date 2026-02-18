import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').toString();
  const password = (body.password || '').toString();
  const identifier = email || (body.phone || 'guest').toString();
  const displayName = (email && email.split('@')[0]) || identifier;

  // Admin credential (developer-friendly)
  const isAdmin = email === 'admin@amoravibe.com' && password === 'admin123';

  const user = isAdmin ? { id: 'admin@amoravibe.com', displayName: 'Admin' } : { id: `local-${displayName}`, displayName };

  const session = { userId: user.id };
  const res = NextResponse.json({ user, nextRoute: isAdmin ? '/admin' : '/dashboard' });

  // Legacy session cookie (keeps current behavior)
  res.cookies.set('lovedate_session', JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // If ADMIN_JWT_SECRET is configured, issue a signed JWT for API auth
  try {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { signToken } = require('@/lib/jwt');
    if (process.env.ADMIN_JWT_SECRET) {
      // include role hint for server-side checks
      const token = await signToken({ userId: user.id, isAdmin: isAdmin });
      res.cookies.set('lovedate_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    }
  } catch (e) {
    // ignore signing errors in dev
    console.warn('JWT signing skipped', e);
  }

  return res;
}

