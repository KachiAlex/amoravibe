import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  // For demo, fetch the first user (replace with auth logic for real app)
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    name: user.name,
    age: user.age,
    location: user.location,
    job: user.job,
    avatar: user.avatar,
    about: user.about,
    interests: user.interests,
  });
}

export async function PATCH(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.age !== undefined) data.age = body.age;
  if (body.location !== undefined) data.location = body.location;
  if (body.job !== undefined) data.job = body.job;
  if (body.avatar !== undefined) data.avatar = body.avatar;
  if (body.about !== undefined) data.about = body.about;
  if (body.interests !== undefined) data.interests = body.interests;

  const updated = await prisma.user.update({ where: { id: session.userId }, data });
  return NextResponse.json({ profile: updated });
}
