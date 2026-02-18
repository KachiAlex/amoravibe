import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/local-admin-seed';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('search') || '').toLowerCase();
  const limit = Number(url.searchParams.get('limit') || '100');
  const offset = Number(url.searchParams.get('offset') || '0');

  let list = getUsers();
  if (q) {
    list = list.filter((u) => u.displayName.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.city || '').toLowerCase().includes(q));
  }

  const total = list.length;
  const page = list.slice(offset, offset + limit);
  return NextResponse.json({ users: page, total });
}
