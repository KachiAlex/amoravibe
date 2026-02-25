import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { visibility = 'public', role = 'member' } = await req.json().catch(() => ({}));
  await prisma.userSpace.create({
    data: {
      userId: session.userId,
      spaceId: params.id,
      visibility,
      role,
    },
  });
  return NextResponse.json({ success: true });
}
