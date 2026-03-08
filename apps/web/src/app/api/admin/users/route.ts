import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { queryAdminUsers } from '@/lib/admin-users';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await requireAdminUser();

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '25');
  const search = searchParams.get('search') ?? undefined;
  const role = searchParams.get('role') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const result = await queryAdminUsers({ page, limit, search, role, status: status as any });
  return NextResponse.json(result);
}
