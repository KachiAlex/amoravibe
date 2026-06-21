import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      adminCount: adminUsers.length,
      admins: adminUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.displayName || 'No name',
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error('[Admin Check] Error:', err);
    return NextResponse.json({ error: 'Failed to check admin accounts', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
