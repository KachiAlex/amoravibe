import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Find all users who liked the current user but haven't been matched yet
    const likes = await prisma.matchAction.findMany({
      where: {
        targetUserId: userId,
        action: 'LIKE',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            displayName: true,
            age: true,
            location: true,
            job: true,
            avatar: true,
            photos: true,
            about: true,
            interests: true,
            prompts: true,
          },
        },
      },
    });

    // Filter out mutual matches (already matched)
    const matchedUserIds = new Set(
      (
        await prisma.match.findMany({
          where: {
            OR: [
              { requesterId: userId },
              { targetUserId: userId },
            ],
          },
          select: { requesterId: true, targetUserId: true },
        })
      ).flatMap((m) => [m.requesterId, m.targetUserId])
    );

    const filtered = likes.filter((like) => !matchedUserIds.has(like.actorId));

    return NextResponse.json({
      likes: filtered.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        user: like.actor,
      })),
      count: filtered.length,
    });
  } catch (err) {
    console.error('[matches/likes] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}
