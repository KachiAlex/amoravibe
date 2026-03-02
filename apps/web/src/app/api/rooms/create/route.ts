import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { spaceId, name, description } = body;

    if (!spaceId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if space exists
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if user is a member of the space
    const spaceMember = await prisma.spaceMember.findUnique({
      where: {
        uniq_space_member: {
          userId: user.id,
          spaceId,
        },
      },
    });

    if (!spaceMember) {
      return NextResponse.json({ error: 'You must join the space first' }, { status: 403 });
    }

    // Check room creation limit
    const roomCount = await prisma.room.count({
      where: {
        spaceId,
        creatorId: user.id,
      },
    });

    if (roomCount >= space.roomCreationLimit) {
      return NextResponse.json(
        { error: `You have reached the room creation limit (${space.roomCreationLimit})` },
        { status: 403 }
      );
    }

    // Create the room
    const room = await prisma.room.create({
      data: {
        name,
        description,
        spaceId,
        creatorId: user.id,
        isPublic: true,
      },
    });

    // Add creator as a member
    await prisma.roomMember.create({
      data: {
        userId: user.id,
        roomId: room.id,
      },
    });

    return NextResponse.json({ message: 'Room created successfully', room }, { status: 201 });
  } catch (err) {
    console.error('[Rooms/Create] Error:', err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
