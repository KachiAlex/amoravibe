import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session?.userId ?? null;
  const limit = Number.isFinite(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 12;

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const matches = await db.match.findMany({
    where: {
      status: 'CONNECTED',
      OR: [{ requesterId: userId }, { targetUserId: userId }],
    },
    include: {
      requester: true,
      target: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: Number.isFinite(limit) ? (limit > 0 ? limit : 12) : 12,
  });

  const payload = matches.map((match: any) => {
    const other = match.requesterId === userId ? match.target : match.requester;
    return {
      id: match.id,
      name: other.displayName ?? other.name ?? 'Match',
      avatar: other.avatar ?? '',
      tagline: other.about ?? undefined,
      role: other.job ?? undefined,
      city: other.location ?? undefined,
      tags: other.interests ?? [],
      matchPercent: match.compatibilityScore ?? 0,
      status: match.status,
      highlighted: match.isHighlighted,
    };
  });

  return NextResponse.json(payload);
}
