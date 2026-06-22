import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getUserId(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    const token = cookies['auth-token'];
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) return payload.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[Notifications] Fetch failed:', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, readAll } = body;

  try {
    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (err) {
    console.error('[Notifications] Update failed:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
