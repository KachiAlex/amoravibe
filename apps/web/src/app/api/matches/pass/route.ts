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
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    if (userId === profileId) {
      return NextResponse.json({ error: 'Cannot pass on yourself' }, { status: 400 });
    }

    // Verify both users exist
    const [actor, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: profileId }, select: { id: true } }),
    ]);

    if (!actor || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Record the pass action
    await prisma.matchAction.upsert({
      where: {
        actorId_targetUserId: {
          actorId: userId,
          targetUserId: profileId,
        },
      },
      update: {
        action: 'PASS',
        createdAt: new Date(),
      },
      create: {
        actorId: userId,
        targetUserId: profileId,
        action: 'PASS',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile passed',
    });
  } catch (err) {
    console.error('[matches/pass] Error:', err);
    return NextResponse.json({ error: 'Failed to pass profile' }, { status: 500 });
  }
}
