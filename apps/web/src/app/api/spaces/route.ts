import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { buildAuthOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(await buildAuthOptions());
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
      });
      userId = user?.id || null;
    }

    // Get all spaces with room counts
    const spaces = await prisma.space.findMany({
      include: {
        rooms: {
          select: { id: true },
        },
        members: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    // Format response
    const formattedSpaces = spaces.map((space) => ({
      id: space.id,
      name: space.name,
      description: space.description,
      icon: space.icon,
      orientation: space.orientation,
      roomCount: space.rooms.length,
      roomCreationLimit: space.roomCreationLimit,
      isMember: userId ? (space.members as any[])?.length > 0 : false,
    }));

    return NextResponse.json({ spaces: formattedSpaces });
  } catch (err) {
    console.error('[Spaces] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
  }
}
