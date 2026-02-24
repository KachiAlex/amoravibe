import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET /api/messages?with=<otherUserId>&cursor=<ISO>&limit=25
export async function GET(req: Request) {
  const url = new URL(req.url);
  const other = url.searchParams.get('with');
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10), 100);

  const session = getSession();
  const userId = session?.userId;

  // Fallback for demo: use first user if no session
  const effectiveUserId = userId ?? (await prisma.user.findFirst()).id;
  if (!other) {
    return NextResponse.json({ error: 'Missing `with` param (other user id)' }, { status: 400 });
  }

  const where = {
    OR: [
      { fromId: effectiveUserId, toId: other },
      { fromId: other, toId: effectiveUserId },
    ],
  };

  const take = limit + 1; // fetch one extra to determine nextCursor
  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  let nextCursor = null;
  if (messages.length > limit) {
    const last = messages.pop();
    nextCursor = last.createdAt.toISOString();
  }

  return NextResponse.json({ messages, nextCursor });
}

// POST to create a message: body { to, text }
export async function POST(req: Request) {
  const session = getSession();
  const body = await req.json().catch(() => ({}));
  const to = body.to;
  const text = body.text;

  if (!to || !text) return NextResponse.json({ error: 'Missing to or text' }, { status: 400 });

  const userId = session?.userId ?? (await prisma.user.findFirst()).id;

  const created = await prisma.message.create({
    data: { fromId: userId, toId: to, text },
  });

  return NextResponse.json({ message: created }, { status: 201 });
}
