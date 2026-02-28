import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { fetchDashboardSnapshot } from '@/lib/dashboard-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  const data = await fetchDashboardSnapshot(session?.userId ?? null);
  return NextResponse.json(data);
}
