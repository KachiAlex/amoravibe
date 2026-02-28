import { NextResponse } from 'next/server';
import { getSession as getLegacySession, setSession } from '@/lib/session';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { buildAuthOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
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
  // Support both legacy `lovedate_session` cookie and NextAuth session
  let userId: string | undefined;
  // legacy session cookie
  const legacy = await getLegacySession();
  if (legacy?.userId) userId = legacy.userId;
  // Try NextAuth session as fallback
  if (!userId) {
    const serverSession = await getServerSession(await buildAuthOptions());
    if (serverSession && (serverSession as any).userId) userId = (serverSession as any).userId;
    // also support session.user?.email or id
    if (!userId && serverSession?.user?.email) {
      // find user id by email when NextAuth session provides only email
      const u = await prisma.user.findUnique({ where: { email: serverSession.user.email as string } });
      if (u) userId = u.id;
    }
  }
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
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
    const updated = await prisma.user.update({ where: { id: userId }, data });
    await setSession({ userId });
    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[Profile] Update failed for userId=', userId, err);
    return NextResponse.json({ error: 'Profile update failed', details: String(err) }, { status: 500 });
  }
}
