import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';
import { broadcastMessageToRoom } from './stream/route';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
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

    // Parse pagination params
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    // Get total message count for pagination metadata
    const totalCount = await prisma.roomMessage.count({
      where: { roomId: params.roomId },
    });

    // Get messages with pagination
    const messages = await prisma.roomMessage.findMany({
      where: { roomId: params.roomId },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ 
      messages,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      }
    });
  } catch (err) {
    console.error('[Rooms/Messages] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

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

    // Broadcast to SSE subscribers
    broadcastMessageToRoom(params.roomId, message);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('[Rooms/Messages] Error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
