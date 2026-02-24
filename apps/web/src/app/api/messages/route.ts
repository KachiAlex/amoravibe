import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

  // For demo, fetch all messages (replace with auth logic for real app)
  const messages = await prisma.message.findMany({
    include: {
      from: true,
      to: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  const created = postMessage(session.userId, { to: body.to, text: body.text });
  return NextResponse.json({ message: created }, { status: 201 });
}
