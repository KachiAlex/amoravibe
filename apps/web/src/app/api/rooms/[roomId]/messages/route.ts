import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { buildAuthOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(await buildAuthOptions());
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a member of the room
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        uniq_room_member: {
          userId: user.id,
          roomId: params.roomId,
        },
      },
    });

    if (!roomMember) {
      return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
    }

    // Get messages
    const messages = await prisma.roomMessage.findMany({
      where: { roomId: params.roomId },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[Rooms/Messages] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(await buildAuthOptions());
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Check if user is a member of the room
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        uniq_room_member: {
          userId: user.id,
          roomId: params.roomId,
        },
      },
    });

    if (!roomMember) {
      return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
    }

    // Create message
    const message = await prisma.roomMessage.create({
      data: {
        roomId: params.roomId,
        userId: user.id,
        text: text.trim(),
      },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('[Rooms/Messages] Error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
