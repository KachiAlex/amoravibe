import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  // For demo, fetch all matches (replace with auth logic for real app)
  const matches = await prisma.match.findMany({
    include: {
      user: true,
    },
  });
  return NextResponse.json(matches);
}
