import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateSettings } from '@/lib/dev-data';

export async function PATCH(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updated = updateSettings(session.userId, body || {});
  return NextResponse.json({ settings: updated });
}
