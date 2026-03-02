import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { setSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    // Get token from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No session' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    }

    // Set legacy session cookie
    await setSession({ userId: payload.userId as string });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[session-to-legacy] error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
