import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { buildAuthOptions } from '../[...nextauth]/route';
import prisma from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST() {
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

    // Reuse the same helper the profile API uses so the cookie format stays consistent.
    await setSession({ userId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[session-to-legacy] error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
