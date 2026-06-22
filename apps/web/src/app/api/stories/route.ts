import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getUserId(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    const token = cookies['auth-token'];
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) return payload.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const now = new Date();

  try {
    // Get stories from users the current user has matched with
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ requesterId: userId }, { targetUserId: userId }],
        status: 'ACCEPTED',
      },
      select: { requesterId: true, targetUserId: true },
    });
    const matchedUserIds = [...new Set(matches.flatMap((m) => [m.requesterId, m.targetUserId]))].filter((id) => id !== userId);

    const stories = await prisma.story.findMany({
      where: {
        userId: { in: matchedUserIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Group by user
    const grouped = stories.reduce<Record<string, typeof stories>>((acc, story) => {
      const uid = story.userId;
      if (!acc[uid]) acc[uid] = [];
      acc[uid].push(story);
      return acc;
    }, {});

    return NextResponse.json({ stories, grouped });
  } catch (err) {
    console.error('[Stories] Fetch failed:', err);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { mediaUrl, caption } = body;

  if (!mediaUrl) {
    return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 });
  }

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const story = await prisma.story.create({
      data: {
        userId,
        mediaUrl,
        caption: caption || null,
        expiresAt,
      },
    });
    return NextResponse.json({ story });
  } catch (err) {
    console.error('[Stories] Create failed:', err);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
