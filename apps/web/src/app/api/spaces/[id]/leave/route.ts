import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await prisma.userSpace.deleteMany({
    where: {
      userId: session.userId,
      spaceId: params.id,
    },
  });
  return NextResponse.json({ success: true });
}
