import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { resolveUserId } from '@/lib/auth-user';

/** Ensure the current request is associated with an onboarded user; redirect otherwise. */
export async function requireOnboardedUser(options?: { redirectTo?: string }) {
  const userId = await resolveUserId();
  if (!userId) {
    redirect(options?.redirectTo ?? '/?openSignIn=1&from=/dashboard');
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { onboardingCompleted: true } });
  if (!user?.onboardingCompleted) {
    redirect('/onboarding?resume=1');
  }

  return userId;
}
