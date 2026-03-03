import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, text } = body;

    if (!recipientId || !text) {
      return NextResponse.json({ error: 'Recipient ID and text are required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        fromId: userId,
        toId: recipientId,
        text: text.trim(),
        read: false,
      },
      include: {
        from: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
        to: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
        read: message.read,
        from: {
          id: message.from.id,
          displayName: message.from.displayName,
          avatar: message.from.avatar,
        },
        to: {
          id: message.to.id,
          displayName: message.to.displayName,
          avatar: message.to.avatar,
        },
      }
    });
  } catch (err) {
    console.error('[Messages/QuickReply] Error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
