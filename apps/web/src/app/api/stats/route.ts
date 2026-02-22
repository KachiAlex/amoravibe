import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMatches, getMessages } from '@/lib/dev-data';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const matches = getMatches(session.userId);
  const messages = getMessages(session.userId);
  return NextResponse.json({ stats: { matches: matches.length, chats: messages.length, views: 0 } });
}
