import type { DashboardData } from '../types';
import { getSession } from '@/lib/session';
import { getMatches, getMessages } from '@/lib/dev-data';

// Server-safe data loader for dashboard content. Uses the in-memory dev store when available.
export async function getDashboardData(): Promise<DashboardData> {
  const session = getSession();
  const userName = session?.userId ?? 'Guest';

  // If session exists, load from dev-data; otherwise fall back to lightweight defaults.
  if (session) {
    const matches = getMatches(session.userId);
    const messages = getMessages(session.userId);
    return {
      userName,
      stats: { matches: matches.length, chats: messages.length, views: 0 },
      matches,
      messages,
    } as DashboardData;
  }

  return {
    userName,
    stats: { matches: 0, chats: 0, views: 0 },
    matches: [],
    messages: [],
  } as DashboardData;
}
