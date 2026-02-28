import { getSession } from '@/lib/session';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { buildAuthOptions } from '@/app/api/auth/[...nextauth]/route';

/** Resolve the current user's ID from either the legacy session cookie or NextAuth session. */
export async function resolveUserId(): Promise<string | null> {
  const legacy = await getSession();
  if (legacy?.userId) {
    return legacy.userId;
  }

  try {
    const authOptions = await buildAuthOptions();
    const authSession = await getServerSession(authOptions);
    const explicitId = (authSession as any)?.userId;
    if (explicitId) {
      return explicitId as string;
    }
    const email = authSession?.user?.email;
    if (email) {
      const user = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (user) {
        return user.id;
      }
    }
  } catch (error) {
    console.warn('[auth-user] Unable to resolve NextAuth session', error);
  }

  return null;
}
