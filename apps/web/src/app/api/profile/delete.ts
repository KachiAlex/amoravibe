import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function DELETE(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    await prisma.user.delete({ where: { id: session.userId } });
    // Optionally: clean up related data (matches, messages, etc.)
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
