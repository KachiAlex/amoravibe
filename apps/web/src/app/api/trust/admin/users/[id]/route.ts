import { NextResponse } from 'next/server';
import { getUser } from '@/lib/admin-users';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const u = getUser(id);
  if (!u) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ user: u });
}
