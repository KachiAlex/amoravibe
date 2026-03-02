import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get token from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies['auth-token'];
    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        displayName: true,
        name: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      name: user.name,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error: any) {
    console.error('[Session] Error:', error?.message);
    return NextResponse.json(
      { error: error?.message || 'Session check failed' },
      { status: 500 }
    );
  }
}
