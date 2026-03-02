import { getSession } from '@/lib/session';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

/** Resolve the current user's ID from either the JWT token or legacy session cookie. */
export async function resolveUserId(): Promise<string | null> {
  // Try JWT token first
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) {
        return payload.userId as string;
      }
    }
  } catch (error) {
    console.warn('[auth-user] Unable to resolve JWT session', error);
  }

  // Fallback to legacy session
  const legacy = await getSession();
  if (legacy?.userId) {
    return legacy.userId;
  }

  return null;
}
