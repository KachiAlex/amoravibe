import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        displayName: true,
        hashedPassword: true,
        createdAt: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return NextResponse.json({ found: false, email: email.toLowerCase() });
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        hasPassword: !!user.hashedPassword,
        createdAt: user.createdAt,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error('[CheckUser] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Database error' },
      { status: 500 }
    );
  }
}
