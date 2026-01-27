import { cookies } from 'next/headers';

const SESSION_COOKIE = 'lovedate_session';
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export interface LovedateSession {
  userId: string;
}

export function getSession(): LovedateSession | null {
  const cookieStore = cookies();
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

export function setSession(session: LovedateSession) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: THIRTY_DAYS,
    path: '/',
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
