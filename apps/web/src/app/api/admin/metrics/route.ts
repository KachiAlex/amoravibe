import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { getAdminMetrics } from '@/lib/admin-metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdminUser();
  const metrics = await getAdminMetrics();
  return NextResponse.json(metrics);
}
