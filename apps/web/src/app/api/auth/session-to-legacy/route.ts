import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { buildAuthOptions } from '../[...nextauth]/route';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const serverSession = await getServerSession(await buildAuthOptions());
    if (!serverSession) return NextResponse.json({ ok: false, error: 'No session' }, { status: 401 });

    // resolve user id
    let userId: string | undefined = (serverSession as any)?.userId;
    if (!userId && serverSession.user?.email) {
      const u = await prisma.user.findUnique({ where: { email: serverSession.user.email as string } });
      if (u) userId = u.id;
    }
    if (!userId) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

    const cookieValue = encodeURIComponent(JSON.stringify({ userId }));
    const maxAge = 60 * 60 * 24 * 30;
    const res = NextResponse.json({ ok: true });
    res.headers.append('Set-Cookie', `lovedate_session=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
    return res;
  } catch (err) {
    console.error('[session-to-legacy] error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
