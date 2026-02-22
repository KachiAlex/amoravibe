import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { acceptMatch } from '@/lib/dev-data';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = params;
  const match = acceptMatch(session.userId, id);
  if (!match) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ match });
}
