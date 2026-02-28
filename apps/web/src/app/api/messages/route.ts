import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

// GET /api/messages?with=<otherUserId>&cursor=<ISO>&limit=25
export async function GET(req: Request) {
  const url = new URL(req.url);
  const otherUserId = url.searchParams.get('with');
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10), 100);
  const markRead = url.searchParams.get('markRead') === '1';

  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!otherUserId) {
    return NextResponse.json({ error: 'Missing `with` param (other user id)' }, { status: 400 });
  }

  if (markRead) {
    await db.message.updateMany({
      where: { toId: session.userId, fromId: otherUserId, read: false },
      data: { read: true },
    });
  }

  const conversationState = await db.conversationState.upsert({
    where: {
      userId_otherUserId: {
        userId: session.userId,
        otherUserId,
      },
    },
    update: markRead ? { lastReadAt: new Date() } : {},
    create: { userId: session.userId, otherUserId },
  });

  const cursorDate = cursor ? new Date(cursor) : null;
  const where = {
    OR: [
      { fromId: session.userId, toId: otherUserId },
      { fromId: otherUserId, toId: session.userId },
    ],
    ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
  };

  const take = limit + 1;
  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  let nextCursor: string | null = null;
  if (messages.length > limit) {
    const last = messages.pop();
    nextCursor = last?.createdAt.toISOString() ?? null;
  }

  return NextResponse.json({
    messages,
    nextCursor,
    conversation: {
      muted: conversationState.muted,
      archived: conversationState.archived,
      lastReadAt: conversationState.lastReadAt?.toISOString() ?? null,
    },
  });
}

// POST to create a message: body { to, text }
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const to = body.to;
  const text = body.text;

  if (!to || !text) {
    return NextResponse.json({ error: 'Missing to or text' }, { status: 400 });
  }

  const created = await db.message.create({
    data: { fromId: session.userId, toId: to, text },
  });

  await db.conversationState.upsert({
    where: {
      userId_otherUserId: { userId: session.userId, otherUserId: to },
    },
    update: { archived: false },
    create: { userId: session.userId, otherUserId: to },
  });

  return NextResponse.json({ message: created }, { status: 201 });
}
