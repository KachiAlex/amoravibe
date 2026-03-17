import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = await getUserIdFromRequest(req);
    if (!currentUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const targetUserId = params.userId;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Cannot view own profile via this endpoint' }, { status: 400 });
    }

    // Get the target user's profile
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        displayName: true,
        name: true,
        age: true,
        location: true,
        job: true,
        about: true,
        interests: true,
        avatar: true,
        photos: true,
        gender: true,
        orientation: true,
        lookingFor: true,
        isVerified: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user and target user share spaces/rooms
    const sharedSpaces = await prisma.spaceMember.findMany({
      where: {
        userId: currentUserId,
        space: {
          members: {
            some: { userId: targetUserId },
          },
        },
      },
      select: {
        spaceId: true,
      },
    });

    const sharedRooms = await prisma.roomMember.findMany({
      where: {
        userId: currentUserId,
        room: {
          members: {
            some: { userId: targetUserId },
          },
        },
      },
      select: {
        roomId: true,
      },
    });

    return NextResponse.json({
      profile: targetUser,
      sharedSpacesCount: sharedSpaces.length,
      sharedRoomsCount: sharedRooms.length,
    });
  } catch (err) {
    console.error('[Users/Profile] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
