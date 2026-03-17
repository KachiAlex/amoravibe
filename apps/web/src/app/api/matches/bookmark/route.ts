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

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    // Fetch user's bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: userId },
      include: {
        bookmarkedUser: {
          select: {
            id: true,
            displayName: true,
            name: true,
            avatar: true,
            about: true,
            job: true,
            location: true,
            interests: true,
            gender: true,
            age: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.bookmark.count({
      where: { userId: userId },
    });

    return NextResponse.json({
      bookmarks: bookmarks.map(b => ({
        id: b.id,
        ...b.bookmarkedUser,
      })),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error('[Matches/Bookmark GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Prevent self-bookmarking
    if (userId === profileId) {
      return NextResponse.json({ error: 'Cannot bookmark yourself' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if bookmarked user exists
    const bookmarkedUser = await prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!bookmarkedUser) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create or update bookmark
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_bookmarkedUserId: {
          userId: userId,
          bookmarkedUserId: profileId,
        },
      },
      update: {},
      create: {
        userId: userId,
        bookmarkedUserId: profileId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile bookmarked',
      bookmark,
    });
  } catch (err) {
    console.error('[Matches/Bookmark] Error:', err);
    return NextResponse.json({ error: 'Failed to bookmark profile' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Delete bookmark from database
    await prisma.bookmark.delete({
      where: {
        userId_bookmarkedUserId: {
          userId: userId,
          bookmarkedUserId: profileId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (err) {
    console.error('[Matches/Bookmark] Error:', err);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
