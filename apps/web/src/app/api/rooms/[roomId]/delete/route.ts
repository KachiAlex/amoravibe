import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { buildAuthOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/db';

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

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is the creator or an admin
    if (room.creatorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'You do not have permission to delete this room' }, { status: 403 });
    }

    // Delete the room (cascade will handle members and messages)
    await prisma.room.delete({
      where: { id: params.roomId },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('[Rooms/Delete] Error:', err);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
