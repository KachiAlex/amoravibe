import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/local-admin-seed';

export async function GET() {
  const users = getUsers();
  return NextResponse.json({ users, total: users.length });
}
