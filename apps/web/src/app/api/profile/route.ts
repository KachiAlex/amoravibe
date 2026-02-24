import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

import prisma from '@/lib/db';
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
  const updated = updateProfile(session.userId, body || {});
  return NextResponse.json({ profile: updated });
}
