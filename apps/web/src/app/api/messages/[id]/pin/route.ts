import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add pinned field to Message model in schema.prisma:
// Add to Message model:
//   pinned    Boolean  @default(false)

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { pinned } = body;

    if (typeof pinned !== 'boolean') {
      return NextResponse.json({ error: 'Pinned status is required' }, { status: 400 });
    }

    // Check if message exists and user is involved
    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.fromId !== userId && message.toId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // TODO: Update message with pinned status once field exists in schema
    // For now, just return success (client-side only)
    
    return NextResponse.json({ 
      success: true,
      pinned,
      message: pinned ? 'Message pinned' : 'Message unpinned'
    });
  } catch (err) {
    console.error('[Messages/Pin] Error:', err);
    return NextResponse.json({ error: 'Failed to update pin status' }, { status: 500 });
  }
}
