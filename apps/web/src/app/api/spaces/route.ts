import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // TODO: Add Room and SpaceMember models to schema.prisma
    // For now, return spaces with mock counts
    const spaces = await prisma.space.findMany();

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
        icon: '🌈', // Mock icon
        orientation: 'general', // Mock orientation
        roomCount,
        roomCreationLimit: 10,
        memberCount,
        onlineCount,
        isMember: Math.random() > 0.5, // Mock membership
      };
    });

    return NextResponse.json({ spaces: formattedSpaces });
  } catch (err) {
    console.error('[Spaces] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}
