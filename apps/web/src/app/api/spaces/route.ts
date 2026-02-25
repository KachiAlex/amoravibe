import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  // List all spaces
  const spaces = await prisma.space.findMany();
  return NextResponse.json({ spaces });
}
