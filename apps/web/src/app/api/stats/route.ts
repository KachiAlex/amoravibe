import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMatches, getMessages } from '@/lib/dev-data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session?.userId ?? null;

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const matches = getMatches(userId);
  const messages = getMessages(userId);

  return NextResponse.json({
    matches: matches.length,
    chats: messages.length,
    views: 0,
  });
}
