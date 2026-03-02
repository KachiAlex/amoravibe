import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if space exists
    const space = await prisma.space.findUnique({
      where: { id: params.id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get all public rooms in the space
    const rooms = await prisma.room.findMany({
      where: {
        spaceId: params.id,
        isPublic: true,
      },
      include: {
        creator: {
          select: { id: true, displayName: true, avatar: true },
        },
        members: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      spaceId: room.spaceId,
      creatorId: room.creatorId,
      creatorName: room.creator.displayName,
      createdAt: room.createdAt.toISOString(),
      isMember: room.members.length > 0,
    }));

    return NextResponse.json({ rooms: formattedRooms });
  } catch (err) {
    console.error('[Spaces/Rooms] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
