import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// Store active connections for broadcasting
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ roomId: string }> }) {
  try {
    const params = await paramsPromise;
    const roomId = params.roomId; // Store roomId for closure access
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a member of the room
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        uniq_room_member: {
          userId: user.id,
          roomId: roomId,
        },
      },
    });

    if (!roomMember) {
      return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
    }

    // Get the last message timestamp from query params (for catching up)
    const url = new URL(req.url);
    const lastSync = url.searchParams.get('lastSync');
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(Date.now() - 5 * 60 * 1000); // Default: last 5 minutes

    // Fetch initial messages since lastSync
    const initialMessages = await prisma.roomMessage.findMany({
      where: {
        roomId: roomId,
        createdAt: { gte: lastSyncDate },
      },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for real-time delivery
    });

    const encoder = new TextEncoder();
    let isConnected = true;

    const stream = new ReadableStream({
      async start(controller) {
        // Register this connection
        if (!activeConnections.has(roomId)) {
          activeConnections.set(roomId, new Set());
        }
        activeConnections.get(roomId)!.add(controller);

        // Send initial messages as catch-up
        for (const msg of initialMessages) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'message', data: msg, isInitial: true })}\n\n`
            )
          );
        }

        // Send initial connection confirmation
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'connected', data: { timestamp: new Date().toISOString() } })}\n\n`
          )
        );

        // Keep connection alive with heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (isConnected) {
            controller.enqueue(encoder.encode(`:heartbeat\n\n`));
          }
        }, 30000);

        // Cleanup on disconnect
        return () => {
          isConnected = false;
          clearInterval(heartbeatInterval);
          const connections = activeConnections.get(roomId);
          if (connections) {
            connections.delete(controller);
            if (connections.size === 0) {
              activeConnections.delete(roomId);
            }
          }
        };
      },
    });

    return new NextResponse(stream, { headers });
  } catch (err) {
    console.error('[Rooms/Messages/Stream] Error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    console.error('[Rooms/Messages/Stream] Error Message:', errorMessage);
    console.error('[Rooms/Messages/Stream] Error Stack:', errorStack);
    return NextResponse.json({ error: 'Failed to establish stream', details: errorMessage }, { status: 500 });
  }
}

/**
 * Broadcast a new message to all connected clients in a room
 * Called internally after a new message is created
 */
export function broadcastMessageToRoom(roomId: string, message: any) {
  const connections = activeConnections.get(roomId);
  if (connections && connections.size > 0) {
    const encoder = new TextEncoder();
    const data = encoder.encode(
      `data: ${JSON.stringify({ type: 'message', data: message })}\n\n`
    );

    connections.forEach((controller) => {
      try {
        controller.enqueue(data);
      } catch (err) {
        console.error('[Broadcast] Error sending to client:', err);
        // Client disconnected, will be cleaned up on next heartbeat
      }
    });
  }
}
