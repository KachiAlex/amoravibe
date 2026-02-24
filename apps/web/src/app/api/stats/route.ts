import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  // For demo, count all matches and messages (replace with auth logic for real app)
  const matchesCount = await prisma.match.count();
  const messagesCount = await prisma.message.count();
  // Profile views would require a separate tracking model
  return NextResponse.json({
    matches: matchesCount,
    chats: messagesCount,
    views: 0,
  });
}
