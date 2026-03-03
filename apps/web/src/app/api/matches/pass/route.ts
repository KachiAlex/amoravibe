import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add Pass model to schema.prisma:
// model Pass {
//   id            String   @id @default(uuid())
//   userId        String
//   passedUserId  String
//   createdAt     DateTime @default(now())
//   user          User     @relation("UserPasses", fields: [userId], references: [id])
//   passedUser    User     @relation("PassedBy", fields: [passedUserId], references: [id])
//   @@unique([userId, passedUserId])
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

    // TODO: Store pass in database once Pass model exists
    // For now, just return success (client-side only)
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile passed'
    });
  } catch (err) {
    console.error('[Matches/Pass] Error:', err);
    return NextResponse.json({ error: 'Failed to pass profile' }, { status: 500 });
  }
}
