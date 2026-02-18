import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/local-admin-seed';

export async function GET() {
  return NextResponse.json(getMetrics());
}
