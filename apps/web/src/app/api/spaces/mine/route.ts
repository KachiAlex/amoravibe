import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const memberships = await prisma.userSpace.findMany({
    where: { userId: session.userId },
    include: { space: true },
  });
  return NextResponse.json({ memberships });
}
