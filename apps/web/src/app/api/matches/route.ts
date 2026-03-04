import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// Fallback matches (dev only) limited to women to respect heterosexual preference
const FALLBACK_MATCHES = [
  {
    id: 'seed-sarah',
    name: 'Sarah Johnson',
    matchPercent: 95,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    tagline: 'Designing delightful experiences, coffee snob, sunset chaser.',
    role: 'UX Designer',
    location: 'San Francisco, CA',
    tags: ['Travel', 'Design', 'Coffee'],
    status: 'CONNECTED',
    isHighlighted: false,
  },
  {
    id: 'seed-emma',
    name: 'Emma Rodriguez',
    matchPercent: 90,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    tagline: 'Fitness devotee, brunch curator, always planning the next getaway.',
    role: 'Marketing Lead',
    location: 'New York, NY',
    tags: ['Brunch', 'Fitness', 'Travel'],
    status: 'CONNECTED',
    isHighlighted: false,
  },
  {
    id: 'seed-aisha',
    name: 'Aisha Bello',
    matchPercent: 87,
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    tagline: 'Book club organizer bringing storytelling into every conversation.',
    role: 'Product Manager',
    location: 'Austin, TX',
    tags: ['Books', 'Podcasts', 'Latte Art'],
    status: 'CONNECTED',
    isHighlighted: false,
  },
  {
    id: 'seed-lucy',
    name: 'Lucy Park',
    matchPercent: 89,
    avatar: 'https://randomuser.me/api/portraits/women/82.jpg',
    tagline: 'Data storyteller who loves sunrise runs and ramen hunts.',
    role: 'Data Analyst',
    location: 'Boston, MA',
    tags: ['Running', 'Foodie', 'Data Viz'],
    status: 'CONNECTED',
    isHighlighted: true,
  },
  {
    id: 'seed-hannah',
    name: 'Hannah Lee',
    matchPercent: 91,
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    tagline: 'Coffee roaster, bookworm, and weekend ceramic artist.',
    role: 'Product Researcher',
    location: 'Portland, OR',
    tags: ['Coffee', 'Books', 'Art'],
    status: 'CONNECTED',
    isHighlighted: false,
  },
];

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session?.userId ?? null;
  const limit = Number.isFinite(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 12;

  if (!userId) {
    // Local/dev fallback: return seeded matches instead of 401/empty
    return NextResponse.json(FALLBACK_MATCHES, { status: 200 });
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
