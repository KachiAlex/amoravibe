import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-request';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// Store active connections for broadcasting
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ roomId: string }> }) {
  try {
    console.log('[Stream] Received request');
    const params = await paramsPromise;
    const roomId = params.roomId;
    console.log('[Stream] roomId:', roomId);
    
    const userId = await getUserIdFromRequest(req);
    console.log('[Stream] userId:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    console.log('[Stream] user found:', !!user);

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
    console.log('[Stream] roomMember found:', !!roomMember);

    if (!roomMember) {
      return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
    }

    // Get the last message timestamp from query params (for catching up)
    const url = new URL(req.url);
    const lastSync = url.searchParams.get('lastSync');
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(Date.now() - 5 * 60 * 1000);
    console.log('[Stream] lastSyncDate:', lastSyncDate);

    // Fetch initial messages since lastSync
    console.log('[Stream] Fetching initial messages...');
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
    console.log('[Stream] Initial messages count:', initialMessages.length);

    // SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for real-time delivery
    });

    console.log('[Stream] Creating TextEncoder');
    const encoder = new TextEncoder();
    let isConnected = true;

    console.log('[Stream] Creating ReadableStream');
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[Stream:start] Function called');
          // Register this connection
          if (!activeConnections.has(roomId)) {
            activeConnections.set(roomId, new Set());
          }
          activeConnections.get(roomId)!.add(controller);
          console.log('[Stream:start] Connection registered');

          // Send initial messages as catch-up
          for (const msg of initialMessages) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'message', data: msg, isInitial: true })}\n\n`
              )
            );
          }
          console.log('[Stream:start] Initial messages sent');

          // Send initial connection confirmation
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'connected', data: { timestamp: new Date().toISOString() } })}\n\n`
            )
          );
          console.log('[Stream:start] Connected message sent');

          // Keep connection alive with heartbeat every 30 seconds
          const heartbeatInterval = setInterval(() => {
            if (isConnected) {
              controller.enqueue(encoder.encode(`:heartbeat\n\n`));
            }
          }, 30000);
          console.log('[Stream:start] Heartbeat interval set');

          // Cleanup on disconnect
          return () => {
            console.log('[Stream:cleanup] Cleanup called');
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
        } catch (err) {
          console.error('[Stream:start] Error in start function:', err);
          throw err;
        }
      },
    });

    console.log('[Stream] ReadableStream created successfully, returning response');
    return new NextResponse(stream, { headers });
  } catch (err) {
    console.error('[Stream] Caught error in try block');
    console.error('[Stream] Error type:', err?.constructor?.name);
    console.error('[Stream] Error:', err);
    if (err instanceof Error) {
      console.error('[Stream] Error message:', err.message);
      console.error('[Stream] Error stack:', err.stack);
    }
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Stream] Returning 500 with message:', errorMessage);
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
