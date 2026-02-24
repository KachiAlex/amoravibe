import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const other = url.searchParams.get('with');
  const session = getSession();
  const userId = session?.userId ?? (await prisma.user.findFirst()).id;

  // SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // This is a demo: poll for new messages every 2s
  let lastSeen = new Date();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const msgs = await prisma.message.findMany({
          where: {
            OR: [
              { fromId: userId, toId: other },
              { fromId: other, toId: userId },
            ],
            createdAt: { gt: lastSeen },
          },
          orderBy: { createdAt: 'asc' },
        });
        for (const m of msgs) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(m)}\n\n`));
          lastSeen = new Date(m.createdAt);
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    cancel() {},
  });

  return new Response(stream, { headers });
}
