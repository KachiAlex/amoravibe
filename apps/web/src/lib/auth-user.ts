import { getSession } from '@/lib/session';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

/** Resolve the current user's ID from either the JWT token or legacy session cookie. */
export async function resolveUserId(): Promise<string | null> {
  console.log('[auth-user] Attempting to resolve userId...');
  
  // Try JWT token first
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    console.log('[auth-user] JWT token present:', !!token);
    
    if (token) {
      const payload = await verifyToken(token);
      console.log('[auth-user] JWT payload:', payload);
      
      if (payload?.userId) {
        console.log('[auth-user] Resolved userId from JWT:', payload.userId);
        return payload.userId as string;
      }
    }
  } catch (error) {
    console.warn('[auth-user] Unable to resolve JWT session', error);
  }

  // Fallback to legacy session
  console.log('[auth-user] Trying legacy session...');
  const legacy = await getSession();
  console.log('[auth-user] Legacy session:', legacy);
  
  if (legacy?.userId) {
    console.log('[auth-user] Resolved userId from legacy session:', legacy.userId);
    return legacy.userId;
  }

  console.log('[auth-user] No userId found, returning null');
  return null;
}
