import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

  const session = getSession();
  const userId = session?.userId ?? (await prisma.user.findFirst()).id;

  // Fetch recent messages involving the user, then reduce into conversation summaries
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
    const user = await prisma.user.findUnique({ where: { id: other } });
    conv.push({
      otherId: other,
      otherName: user?.name ?? user?.email ?? 'Unknown',
      avatar: user?.avatar ?? null,
      lastMessage: m.text,
      lastAt: m.createdAt,
      unread,
    });
    if (conv.length >= limit) break;
  }

  return NextResponse.json({ conversations: conv });
}
