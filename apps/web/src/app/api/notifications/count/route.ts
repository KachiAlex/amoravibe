import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Temporary stub endpoint to satisfy notifications count fetch.
// Returns zero until real notifications system is implemented.
export async function GET() {
  return NextResponse.json({ count: 0 });
}
