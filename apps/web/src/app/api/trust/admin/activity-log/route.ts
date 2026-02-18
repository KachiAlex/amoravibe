import { NextResponse } from 'next/server';
import { getActivityLog } from '@/lib/local-admin-seed';

export async function GET() {
  return NextResponse.json({ entries: getActivityLog() });
}
