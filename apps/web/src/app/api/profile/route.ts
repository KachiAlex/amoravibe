import { NextResponse } from 'next/server';
import { getSession as getLegacySession, setSession } from '@/lib/session';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getUserIdFromRequest(req: Request, bodyUserId?: string): Promise<string | null> {
  try {
    // If userId is provided in body (for onboarding), verify it exists in DB first
    if (bodyUserId) {
      const user = await prisma.user.findUnique({ where: { id: bodyUserId } });
      if (user) {
        console.log('[Profile] Using userId from body:', bodyUserId);
        return bodyUserId;
      }
    }

    // Get token from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) {
        console.log('[Profile] Using userId from auth-token:', payload.userId);
        return payload.userId as string;
      }
    }

    // Fallback to legacy session
    const legacy = await getLegacySession();
    if (legacy?.userId) {
      console.log('[Profile] Using userId from legacy session:', legacy.userId);
      return legacy.userId;
    }

    return null;
  } catch (err) {
    console.error('[Profile] Error getting userId:', err);
    return null;
  }
}

export async function GET() {
  // For demo, fetch the first user (replace with auth logic for real app)
  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    name: user.name,
    age: user.age,
    location: user.location,
    job: user.job,
    avatar: user.avatar,
    about: user.about,
    interests: user.interests,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = await getUserIdFromRequest(req, body.userId);
  console.log('[Profile] Resolved userId:', userId);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.displayName !== undefined) data.displayName = body.displayName;
  if (body.age !== undefined) data.age = body.age;
  if (body.location !== undefined) data.location = body.location;
  if (body.job !== undefined) data.job = body.job;
  if (body.avatar !== undefined) data.avatar = body.avatar;
  if (body.about !== undefined) data.about = body.about;
  if (body.interests !== undefined) data.interests = body.interests;
  if (body.onboardingCompleted !== undefined) data.onboardingCompleted = Boolean(body.onboardingCompleted);
  if (body.onboardingStep !== undefined) data.onboardingStep = body.onboardingStep;
  if (body.onboardingCompleted) {
    data.profileCompletedAt = new Date();
  }

  try {
    // First check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      console.error('[Profile] User not found:', userId);
      return NextResponse.json({ error: 'User not found. Please sign up again.' }, { status: 404 });
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    await setSession({ userId });
    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[Profile] Update failed for userId=', userId, err);
    return NextResponse.json({ error: 'Profile update failed', details: String(err) }, { status: 500 });
  }
}
