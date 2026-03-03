import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add Bookmark model to schema.prisma:
// model Bookmark {
//   id              String   @id @default(uuid())
//   userId          String
//   bookmarkedUserId String
//   createdAt       DateTime @default(now())
//   user            User     @relation("UserBookmarks", fields: [userId], references: [id])
//   bookmarkedUser  User     @relation("BookmarkedBy", fields: [bookmarkedUserId], references: [id])
//   @@unique([userId, bookmarkedUserId])
// }

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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Store bookmark in database once Bookmark model exists
    // For now, just return success (client-side only)
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile bookmarked'
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

    // TODO: Remove bookmark from database once Bookmark model exists
    // For now, just return success (client-side only)
    
    return NextResponse.json({ 
      success: true,
      message: 'Bookmark removed'
    });
  } catch (err) {
    console.error('[Matches/Bookmark] Error:', err);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
