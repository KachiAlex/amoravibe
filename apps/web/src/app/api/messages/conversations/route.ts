import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Require authentication - no fallback users allowed
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch recent messages involving only this user
    const recent = await prisma.message.findMany({
      where: { OR: [{ fromId: userId }, { toId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const seen = new Set<string>();
    const conv: Array<any> = [];
    for (const m of recent) {
      const other = m.fromId === userId ? m.toId : m.fromId;
      if (seen.has(other)) continue;
      seen.add(other);
      // count unread messages from other -> me
      const unread = await prisma.message.count({ where: { fromId: other, toId: userId, read: false } });
      const otherUser = await prisma.user.findUnique({ where: { id: other } });
      conv.push({
        otherId: other,
        otherName: otherUser?.name ?? otherUser?.email ?? 'Unknown',
        avatar: otherUser?.avatar ?? null,
        lastMessage: m.text,
        lastAt: m.createdAt,
        unread,
      });
      if (conv.length >= limit) break;
    }

    return NextResponse.json({ conversations: conv });
  } catch (err) {
    console.error('[Messages/Conversations] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
