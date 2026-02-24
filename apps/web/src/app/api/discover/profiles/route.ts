import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/discover/profiles?cursor=<id>&limit=10&ageMin=18&ageMax=99&location=...&interests=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
  const cursor = url.searchParams.get('cursor');
  const ageMin = url.searchParams.get('ageMin') ? parseInt(url.searchParams.get('ageMin')) : undefined;
  const ageMax = url.searchParams.get('ageMax') ? parseInt(url.searchParams.get('ageMax')) : undefined;
  const location = url.searchParams.get('location');
  const interests = url.searchParams.get('interests')?.split(',').map(s => s.trim()).filter(Boolean);

  const where: any = { banned: false };
  if (ageMin !== undefined) where.age = { ...(where.age || {}), gte: ageMin };
  if (ageMax !== undefined) where.age = { ...(where.age || {}), lte: ageMax };
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (interests && interests.length > 0) where.interests = { hasSome: interests };

  const take = limit + 1;
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      name: true,
      age: true,
      job: true,
      location: true,
      avatar: true,
      about: true,
      interests: true,
    },
  });
  let nextCursor = null;
  if (users.length > limit) {
    const last = users.pop();
    nextCursor = last.id;
  }
  return NextResponse.json({ profiles: users, nextCursor });
}
