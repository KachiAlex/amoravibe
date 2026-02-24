import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req: Request) {
  // NextAuth provides signOut via client, but provide a simple endpoint
  return NextResponse.json({ ok: true });
}
