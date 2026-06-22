import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session?.userId ?? null;

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [matchCount, messageCount, user] = await Promise.all([
    prisma.match.count({
      where: {
        status: 'CONNECTED',
        OR: [{ requesterId: userId }, { targetUserId: userId }],
      },
    }),
    prisma.message.count({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { profileViews: true },
    }),
  ]);

  return NextResponse.json({
    matches: matchCount,
    chats: messageCount,
    views: user?.profileViews ?? 0,
  });
}
