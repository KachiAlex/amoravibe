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
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });
    }

    // Verify both users exist
    const [actor, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: profileId }, select: { id: true } }),
    ]);

    if (!actor || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Record the like action
    await prisma.matchAction.upsert({
      where: {
        actorId_targetUserId: {
          actorId: userId,
          targetUserId: profileId,
        },
      },
      update: {
        action: 'LIKE',
        createdAt: new Date(),
      },
      create: {
        actorId: userId,
        targetUserId: profileId,
        action: 'LIKE',
      },
    });

    // Check if this creates a mutual match (other user liked back)
    const mutualLike = await prisma.matchAction.findUnique({
      where: {
        actorId_targetUserId: {
          actorId: profileId,
          targetUserId: userId,
        },
      },
    });

    let isMatch = false;
    if (mutualLike && mutualLike.action === 'LIKE') {
      isMatch = true;
      // Create a Match record for mutual likes
      await prisma.match.upsert({
        where: {
          requesterId_targetUserId: {
            requesterId: userId,
            targetUserId: profileId,
          },
        },
        update: { status: 'ACCEPTED' },
        create: {
          requesterId: userId,
          targetUserId: profileId,
          status: 'ACCEPTED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      isMatch,
      message: isMatch ? "It's a match! 🎉" : 'Like sent successfully',
    });
  } catch (err) {
    console.error('[matches/like] Error:', err);
    return NextResponse.json({ error: 'Failed to like profile' }, { status: 500 });
  }
}
