import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.log('[Spaces] No userId found - not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[Spaces] Fetching spaces for user:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, orientation: true },
    });

    if (!user) {
      console.log('[Spaces] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Spaces] User orientation:', user.orientation);

    // Filter spaces based on user orientation
    // Map user orientation to space orientation
    let spaceOrientation: string;
    if (user.orientation?.toLowerCase() === 'heterosexual' || user.orientation?.toLowerCase() === 'straight') {
      spaceOrientation = 'straight';
    } else if (user.orientation?.toLowerCase() === 'homosexual' || user.orientation?.toLowerCase() === 'lgbtq' || user.orientation?.toLowerCase() === 'lgbtq+') {
      spaceOrientation = 'lgbtq';
    } else {
      // Default to straight if orientation is not set
      spaceOrientation = 'straight';
    }

    console.log('[Spaces] Filtering for space orientation:', spaceOrientation);

    const spaces = await prisma.space.findMany({
      where: {
        orientation: spaceOrientation,
      },
    });
    
    console.log('[Spaces] Found spaces:', spaces.length);

    // Format response with mock data
    const formattedSpaces = spaces.map((space) => {
      // Mock counts until database schema is updated
      const memberCount = Math.floor(Math.random() * 200) + 50;
      const onlineCount = Math.floor(Math.random() * 20) + 5;
      const roomCount = Math.floor(Math.random() * 10) + 3;
      
      return {
        id: space.id,
        name: space.name,
        description: space.description,
        icon: space.icon || '🌈',
        orientation: space.orientation || 'general',
        roomCount,
        roomCreationLimit: 10,
        memberCount,
        onlineCount,
        isMember: true, // User can only see their own space
      };
    });

    console.log('[Spaces] Returning formatted spaces:', formattedSpaces);
    return NextResponse.json({ spaces: formattedSpaces });
  } catch (err) {
    console.error('[Spaces] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}
