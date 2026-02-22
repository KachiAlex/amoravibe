import { NextResponse } from 'next/server';
import { seedUser, clearStore } from '@/lib/dev-data';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const users: string[] = body.users || ['local-guest', 'admin@amoravibe.com'];

  // clear existing store optional
  if (body.clear) clearStore();

  users.forEach((u) => seedUser(u));

  return NextResponse.json({ seeded: users });
}
