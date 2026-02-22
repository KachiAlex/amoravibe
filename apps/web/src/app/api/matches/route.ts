import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMatches } from '@/lib/dev-data';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const matches = getMatches(session.userId);
  return NextResponse.json({ matches });
}
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMatches } from '@/lib/dev-data';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const data = getMatches(session.userId);
  return NextResponse.json({ matches: data });
}
