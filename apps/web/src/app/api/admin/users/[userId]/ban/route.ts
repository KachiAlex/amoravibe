
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

async function readAction(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      return typeof body?.action === 'string' ? body.action : null;
    } catch {
      return null;
    }
  }

  try {
    const form = await request.formData();
    const action = form.get('action');
    return typeof action === 'string' ? action : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  await requireAdminUser();
  const action = await readAction(request);
  if (!action || (action !== 'ban' && action !== 'unban')) {
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  const shouldBan = action === 'ban';

  try {
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { banned: shouldBan },
      select: { id: true, email: true, banned: true, role: true },
    });

    return NextResponse.json({ user, action: shouldBan ? 'banned' : 'unbanned' });
  } catch (error) {
    console.error('[admin] Failed to toggle ban', error);
    return NextResponse.json({ message: 'Unable to update user' }, { status: 500 });
  }
}
