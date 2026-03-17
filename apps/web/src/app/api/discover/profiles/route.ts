import { NextResponse } from 'next/server';
import { getSession as getLegacySession } from '@/lib/session';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    // Get token from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) return payload.userId as string;
    }

    // Fallback to legacy session
    const legacy = await getLegacySession();
    if (legacy?.userId) return legacy.userId;

    return null;
  } catch (err) {
    console.error('[discover/profiles] Error getting userId:', err);
    return null;
  }
}

// GET /api/discover/profiles?cursor=<id>&limit=10&ageMin=18&ageMax=99&radiusKm=100&interests=...&verifiedOnly=...
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current user to check their preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        orientation: true,
        lookingFor: true,
        location: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
    const cursor = url.searchParams.get('cursor');
    const ageMinParam = url.searchParams.get('ageMin');
    const ageMaxParam = url.searchParams.get('ageMax');
    const ageMin = ageMinParam ? parseInt(ageMinParam, 10) : 18;
    const ageMax = ageMaxParam ? parseInt(ageMaxParam, 10) : 99;
    const interests = url.searchParams.get('interests')?.split(',').map(s => s.trim()).filter(Boolean);
    const verifiedOnly = url.searchParams.get('verifiedOnly') === '1';

    // Build where clause for filtering candidates
    const where: any = { 
      banned: false,
      id: { not: userId }, // Exclude self
      age: {
        gte: ageMin,
        lte: ageMax,
      },
    };

    // Filter by interests if provided
    if (interests && interests.length > 0) {
      where.interests = { hasSome: interests };
    }

    // Only show verified profiles if user filters by it
    if (verifiedOnly) {
      where.isVerified = true;
    }

    // Exclude profiles user already matched with or passed on
    const existingActions = await prisma.matchAction.findMany({
      where: {
        actorId: userId,
      },
      select: {
        targetUserId: true,
      },
    });
    const excludeIds = existingActions.map(a => a.targetUserId);
    
    // Also exclude incoming matches
    const incomingMatches = await prisma.match.findMany({
      where: {
        targetUserId: userId,
      },
      select: {
        requesterId: true,
      },
    });
    const incomingIds = incomingMatches.map(m => m.requesterId);
    
    if (excludeIds.length > 0 || incomingIds.length > 0) {
      where.id = {
        notIn: [...excludeIds, ...incomingIds],
      };
    }

    const take = limit + 1;
    const profiles = await prisma.user.findMany({
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
        photos: true,
        about: true,
        interests: true,
        gender: true,
        orientation: true,
        isVerified: true,
      },
    });

    let nextCursor = null;
    if (profiles.length > limit) {
      const last = profiles.pop();
      nextCursor = last ? last.id : null;
    }

    return NextResponse.json({ 
      profiles: profiles.map(p => ({
        ...p,
        distance: 'nearby', // TODO: Calculate distance from currentUser.location
      })),
      nextCursor 
    });
  } catch (err) {
    console.error('[discover/profiles] Error:', err);
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 });
  }
}
