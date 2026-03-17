import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Require authentication - no fallback users allowed
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number.isFinite(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 12;

    // Verify user exists and load preferences
    const currentUser = (await db.user.findUnique({
      where: { id: userId },
    })) as any;

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orientation = currentUser?.orientation?.toLowerCase();
    const wantsWomenOnly = orientation === 'straight';
    const currentIntent = currentUser?.lookingFor?.toLowerCase() ?? null;

    const seriousnessScore = (intent: string | null) => {
      const map: Record<string, number> = {
        casual: 1,
        friendship: 1,
        friends: 1,
        relationship: 2,
        serious: 2,
        marriage: 3,
        longterm: 3,
      };
      if (!intent) return 0;
      return map[intent] ?? 0;
    };

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

    const payload = matches
      .map((match: any) => {
        const other = match.requesterId === userId ? match.target : match.requester;
        return {
          id: match.id,
          name: other.displayName ?? other.name ?? 'Match',
          avatar: other.avatar ?? '',
          tagline: other.about ?? undefined,
          role: other.job ?? undefined,
          city: other.location ?? undefined,
          lookingFor: other.lookingFor ?? undefined,
          tags: other.interests ?? [],
          matchPercent: match.compatibilityScore ?? 0,
          status: match.status,
          highlighted: match.isHighlighted,
          gender: other.gender ?? undefined,
        };
      })
      // Enforce orientation preference: for straight users, only show female profiles
      .filter((m) => {
        if (!wantsWomenOnly) return true;
        return (m.gender ?? '').toLowerCase() === 'female';
      })
      // Enforce intent compatibility: avoid mismatches (e.g., casual vs marriage)
      .filter((m) => {
        if (!currentIntent) return true;
        const userScore = seriousnessScore(currentIntent);
        const otherScore = seriousnessScore((m as any).lookingFor ?? null);
        if (userScore === 0 || otherScore === 0) return true;
        // Allow if both are similar level, or both within casual/friendship
        // Reject if one is casual/friendship and the other is relationship/marriage level
        const diff = Math.abs(userScore - otherScore);
        return diff <= 1;
      });

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[Matches GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
