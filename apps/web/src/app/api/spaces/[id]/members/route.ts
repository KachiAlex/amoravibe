import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add SpaceMember model to schema.prisma:
// model SpaceMember {
//   id        String   @id @default(uuid())
//   userId    String
//   spaceId   String
//   joinedAt  DateTime @default(now())
//   user      User     @relation(fields: [userId], references: [id])
//   space     Space    @relation(fields: [spaceId], references: [id])
//   @@unique([userId, spaceId])
// }
//
// TODO: Add to User model:
//   lastActive  DateTime?
//   bio         String?

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Check if space exists
    const space = await prisma.space.findUnique({
      where: { id: params.id },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // TODO: Replace with actual query once SpaceMember model exists
    // For now, return sample users from the database
    const sampleUsers = await prisma.user.findMany({
      take: 10,
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        displayName: true,
        avatar: true,
        about: true,
        interests: true,
      },
    });

    // Format response with mock online status
    const formattedMembers = sampleUsers.map((member) => {
      // Mock online status (random for now)
      const isOnline = Math.random() > 0.7;

      // Calculate compatibility score based on shared interests
      let compatibilityScore: number | undefined;
      if (user.interests && member.interests) {
        const userInterests = user.interests;
        const memberInterests = member.interests;
        
        if (userInterests.length > 0 && memberInterests.length > 0) {
          const sharedInterests = userInterests.filter(interest => 
            memberInterests.includes(interest)
          );
          compatibilityScore = Math.round(
            (sharedInterests.length / Math.max(userInterests.length, memberInterests.length)) * 100
          );
        }
      }

      return {
        id: member.id,
        displayName: member.displayName || 'Anonymous',
        avatar: member.avatar,
        bio: member.about,
        interests: member.interests || [],
        isOnline,
        lastActive: new Date().toISOString(),
        compatibilityScore,
      };
    });

    return NextResponse.json({ members: formattedMembers });
  } catch (err) {
    console.error('[Spaces/Members] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
