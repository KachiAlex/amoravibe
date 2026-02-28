import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const match = await db.match.findUnique({
    where: { id: params.id },
    include: { requester: true, target: true },
  });

  if (!match) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (match.requesterId !== session.userId && match.targetUserId !== session.userId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const otherUserId = match.requesterId === session.userId ? match.targetUserId : match.requesterId;

  const updated = await db.match.update({
    where: { id: match.id },
    data: {
      status: 'CONNECTED',
      actions: {
        create: {
          actorId: session.userId,
          targetUserId: otherUserId,
          action: 'LIKE',
        },
      },
    },
    include: { requester: true, target: true },
  });

  return NextResponse.json({ match: updated });
}
