import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const duration = body.duration || 30; // minutes

    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { boostExpiresAt: expiresAt },
    });

    return NextResponse.json({
      success: true,
      boostExpiresAt: expiresAt.toISOString(),
      message: `Boost activated for ${duration} minutes!`,
    });
  } catch (err) {
    console.error('[Boost] Error:', err);
    return NextResponse.json({ error: 'Failed to activate boost' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { boostExpiresAt: true },
    });

    const now = new Date();
    const isActive = user?.boostExpiresAt ? user.boostExpiresAt > now : false;
    const expiresIn = isActive ? Math.max(0, Math.floor((user!.boostExpiresAt.getTime() - now.getTime()) / 1000)) : 0;

    return NextResponse.json({
      isActive,
      boostExpiresAt: user?.boostExpiresAt?.toISOString() || null,
      expiresIn,
    });
  } catch (err) {
    console.error('[Boost] Error:', err);
    return NextResponse.json({ error: 'Failed to get boost status' }, { status: 500 });
  }
}
