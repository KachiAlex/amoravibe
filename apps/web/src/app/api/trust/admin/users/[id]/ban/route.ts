import { NextResponse } from 'next/server';
import { banUser, getUser } from '@/lib/local-admin-seed';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => ({}));
  const { ban = true } = body as { ban?: boolean };
  const updated = banUser(id, ban);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ id: updated.id, banned: updated.banned });
}
