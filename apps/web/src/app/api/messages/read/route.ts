import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function PATCH(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const other = body.other;
  if (!other) return NextResponse.json({ error: 'Missing other user id' }, { status: 400 });

  const updated = await prisma.message.updateMany({
    where: { fromId: other, toId: session.userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ updated: updated.count });
}
