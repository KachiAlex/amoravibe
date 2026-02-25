import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // List all spaces
  const spaces = await prisma.space.findMany();
  return NextResponse.json({ spaces });
}
