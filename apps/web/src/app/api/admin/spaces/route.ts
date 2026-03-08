import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdminUser();
  const spaces = await prisma.space.findMany({
    include: { _count: { select: { members: true } } },
  });
  const formatted = spaces.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    orientation: s.orientation,
    memberCount: s._count?.members ?? 0,
  }));
  return NextResponse.json({ spaces: formatted });
}

export async function POST(req: Request) {
  await requireAdminUser();
  const { name, description, orientation } = await req.json();
  if (!name || !orientation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const space = await prisma.space.create({
    data: { name, description, orientation },
  });
  return NextResponse.json({ space }, { status: 201 });
}
