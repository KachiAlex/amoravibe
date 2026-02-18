import { NextResponse } from 'next/server';
import { getUser } from '@/lib/local-admin-seed';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = getUser(id);
  if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}
