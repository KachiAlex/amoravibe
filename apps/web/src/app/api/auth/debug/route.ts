import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ SET' : '✗ MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envVars);
}
