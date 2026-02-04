import type { Match } from '@/lib/api-types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const status = url.searchParams.get('status') || 'active';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100);

  console.log('[Matches API] GET called with:', { userId, status, limit });

  if (!userId) {
    return Response.json(
      { error: 'userId required', matches: [] },
      { status: 400 }
    );
  }

  // For now, return empty matches
  // In the future, call identity service at:
  // const backendUrl = `http://localhost:4001/api/v1/matches/${userId}?status=${status}&limit=${limit}`;
  
  return Response.json({
    matches: [],
    total: 0,
    status,
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // POST /api/dashboard/matches/:matchId/unmatch
  if (path.includes('/unmatch')) {
    const matchId = path.split('/').slice(-2, -1)[0];
    const body = await request.json();
    
    console.log('[Matches API] Unmatch called for:', { matchId, userId: body.userId });
    
    // TODO: Call backend unmatch endpoint
    return Response.json({ success: true, message: 'Unmatched' });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // DELETE /api/dashboard/matches/:matchId/block
  if (path.includes('/block')) {
    const matchId = path.split('/').slice(-2, -1)[0];
    const body = await request.json();
    
    console.log('[Matches API] Block called for:', { matchId, userId: body.userId, blockedUserId: body.blockedUserId });
    
    // TODO: Call backend block endpoint
    return Response.json({ success: true, message: 'User blocked' });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
