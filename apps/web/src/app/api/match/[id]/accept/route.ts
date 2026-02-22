import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { acceptMatch } from '@/lib/dev-data';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id } = params;
  const updated = acceptMatch(session.userId, id);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ match: updated });
}
