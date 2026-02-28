import { NextResponse } from 'next/server';
import { resetAdminUsers } from '@/lib/admin-users';

export async function POST(request: Request) {
  const overrides = await request.json().catch(() => undefined);
  resetAdminUsers(overrides);
  return NextResponse.json({ ok: true });
}
