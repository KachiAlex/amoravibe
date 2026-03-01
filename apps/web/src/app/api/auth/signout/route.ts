import { NextResponse } from 'next/server';

export async function POST() {
  // NextAuth provides signOut via client, but provide a simple endpoint
  return NextResponse.json({ ok: true });
}
