import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/admin-users';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const u = verifyUser(id);
  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ user: u });
}
