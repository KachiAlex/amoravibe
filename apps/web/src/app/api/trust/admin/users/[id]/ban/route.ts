import { NextResponse } from 'next/server';
import { banUser } from '@/lib/admin-users';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    // ignore
  }
  const ban = typeof body.ban === 'boolean' ? body.ban : true;
  const u = banUser(id, ban);
  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ user: u });
}
