import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
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

    try {
      await ensureGeneralRoom(space.id, user.id);
    } catch (roomErr) {
      console.warn('[Spaces/Rooms] Failed to ensure general room:', roomErr);
      // Continue anyway, as general room may already exist
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
      orderBy: [
        { isGeneral: 'desc' },
        { createdAt: 'desc' },
      ],
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
      isGeneral: room.isGeneral,
    }));

    return NextResponse.json({ rooms: formattedRooms });
  } catch (err) {
    console.error('[Spaces/Rooms] Error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    console.error('[Spaces/Rooms] Error Message:', errorMessage);
    console.error('[Spaces/Rooms] Error Stack:', errorStack);
    return NextResponse.json({ error: 'Failed to fetch rooms', details: errorMessage }, { status: 500 });
  }
}

async function ensureGeneralRoom(spaceId: string, userId: string) {
  try {
    const existing = await prisma.room.findFirst({
      where: { spaceId, isGeneral: true },
    });
    if (existing) {
      await ensureRoomMembership(existing.id, userId);
      console.log('[Spaces/Rooms] Found existing general room:', existing.id);
      return existing;
    }
    const room = await prisma.room.create({
      data: {
        name: 'General Chat',
        description: 'Main hangout for everyone in this space.',
        spaceId,
        creatorId: userId,
        isPublic: true,
        isGeneral: true,
      },
    });
    await ensureRoomMembership(room.id, userId);
    console.log('[Spaces/Rooms] Created general room:', room.id);
    return room;
  } catch (err) {
    console.error('[Spaces/Rooms] ensureGeneralRoom failed:', err instanceof Error ? err.message : String(err));
    throw err;
  }
}

async function ensureRoomMembership(roomId: string, userId: string) {
  try {
    await prisma.roomMember.create({
      data: {
        roomId,
        userId,
      },
    });
  } catch (err: any) {
    // Ignore duplicate constraint errors
    if (!(err?.code === 'P2002')) {
      console.warn('[Spaces/Rooms] Failed to ensure membership', err);
    }
  }
}
