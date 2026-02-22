import { NextResponse } from 'next/server';
import { listUsers } from '@/lib/admin-users';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('search') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20', 10) || 20;
  const result = listUsers({ search: q, limit });
  return NextResponse.json(result);
}
