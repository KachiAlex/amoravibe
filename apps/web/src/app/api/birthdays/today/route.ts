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

    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get('spaceId');
    const roomId = searchParams.get('roomId');

    if (!spaceId && !roomId) {
      return NextResponse.json(
        { error: 'Either spaceId or roomId is required' },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');

    let birthdayUsers: any[] = [];

    if (spaceId) {
      // Get all users with birthdays today in a specific space
      const members = await prisma.spaceMember.findMany({
        where: { spaceId },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              name: true,
              avatar: true,
              birthDate: true,
            },
          },
        },
      });

      birthdayUsers = members
        .map((m) => m.user)
        .filter((u) => {
          if (!u.birthDate) return false;
          const birthMonth = String(u.birthDate.getMonth() + 1).padStart(2, '0');
          const birthDay = String(u.birthDate.getDate()).padStart(2, '0');
          return birthMonth === todayMonth && birthDay === todayDay;
        })
        .map((u) => ({
          id: u.id,
          displayName: u.displayName || u.name || 'Unknown',
          avatar: u.avatar || null,
        }));
    }

    if (roomId) {
      // Get all users with birthdays today in a specific room
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              name: true,
              avatar: true,
              birthDate: true,
            },
          },
        },
      });

      birthdayUsers = members
        .map((m) => m.user)
        .filter((u) => {
          if (!u.birthDate) return false;
          const birthMonth = String(u.birthDate.getMonth() + 1).padStart(2, '0');
          const birthDay = String(u.birthDate.getDate()).padStart(2, '0');
          return birthMonth === todayMonth && birthDay === todayDay;
        })
        .map((u) => ({
          id: u.id,
          displayName: u.displayName || u.name || 'Unknown',
          avatar: u.avatar || null,
        }));
    }

    return NextResponse.json({
      birthdayUsers,
      count: birthdayUsers.length,
      date: today.toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('[Birthdays/Today] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch birthdays' }, { status: 500 });
  }
}
