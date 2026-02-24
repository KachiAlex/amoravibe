import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

  // For demo, count all matches and messages (replace with auth logic for real app)
  const matchesCount = await prisma.match.count();
  const messagesCount = await prisma.message.count();
  // Profile views would require a separate tracking model
  return NextResponse.json({
    matches: matchesCount,
    chats: messagesCount,
    views: 0
  });
}
