import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcryptjs from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const email = 'admin@amoravibe.com';
    const newPassword = 'admin123';

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('[Admin Reset Password] Error:', err);
    return NextResponse.json({ error: 'Failed to reset password', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
