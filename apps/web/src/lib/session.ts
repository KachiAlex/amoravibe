import { cookies } from 'next/headers';

const SESSION_COOKIE = 'lovedate_session';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export interface LovedateSession {
  userId: string;
}

export async function getSession(): Promise<LovedateSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LovedateSession;
  } catch (error) {
    console.warn('Invalid session cookie, clearing it', error);
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
}

export async function setSession(session: LovedateSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
