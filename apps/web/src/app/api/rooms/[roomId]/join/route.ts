import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
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

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { space: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is a member of the space
    const spaceMember = await prisma.spaceMember.findUnique({
      where: {
        uniq_space_member: {
          userId: user.id,
          spaceId: room.spaceId,
        },
      },
    });

    if (!spaceMember) {
      return NextResponse.json({ error: 'You must join the space first' }, { status: 403 });
    }

    // Check if already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        uniq_room_member: {
          userId: user.id,
          roomId: params.roomId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ message: 'Already a member of this room' }, { status: 200 });
    }

    // Add user to room
    const roomMember = await prisma.roomMember.create({
      data: {
        userId: user.id,
        roomId: params.roomId,
      },
    });

    return NextResponse.json({ message: 'Successfully joined room', roomMember }, { status: 201 });
  } catch (err) {
    console.error('[Rooms/Join] Error:', err);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
