import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

  // For demo, fetch all matches (replace with auth logic for real app)
  const matches = await prisma.match.findMany({
    include: {
      user: true,
    },
  });
  return NextResponse.json(matches);
}
