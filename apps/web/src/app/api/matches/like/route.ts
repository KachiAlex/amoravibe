import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add Like model to schema.prisma:
// model Like {
//   id           String   @id @default(uuid())
//   userId       String
//   likedUserId  String
//   createdAt    DateTime @default(now())
//   user         User     @relation("UserLikes", fields: [userId], references: [id])
//   likedUser    User     @relation("LikedBy", fields: [likedUserId], references: [id])
//   @@unique([userId, likedUserId])
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

    // Check if target profile exists
    const targetUser = await prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // TODO: Replace with Like model once it exists in schema
    // For now, create a Match record directly
    const existingMatch = await prisma.match.findFirst({
      where: {
        userId,
        matchedId: profileId,
      },
    });

    if (!existingMatch) {
      await prisma.match.create({
        data: {
          userId,
          matchedId: profileId,
        },
      });
    }

    // Check for reciprocal match
    const reciprocalMatch = await prisma.match.findFirst({
      where: {
        userId: profileId,
        matchedId: userId,
      },
    });

    const isMatch = !!reciprocalMatch;

    return NextResponse.json({ 
      success: true, 
      isMatch,
      message: isMatch ? "It's a match! 🎉" : 'Like sent successfully'
    });
  } catch (err) {
    console.error('[Matches/Like] Error:', err);
    return NextResponse.json({ error: 'Failed to like profile' }, { status: 500 });
  }
}
