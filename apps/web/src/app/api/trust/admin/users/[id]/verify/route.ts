import { NextResponse } from 'next/server';
import { verifyUser, getUser } from '@/lib/local-admin-seed';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const updated = verifyUser(id);
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ id: updated.id, verified: updated.isVerified });
}
