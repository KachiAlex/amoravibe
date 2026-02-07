const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const status = url.searchParams.get('status') || 'active';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100);

  console.log('[Matches API] GET called with:', { userId, status, limit });

  if (!userId) {
    return Response.json({ error: 'userId required', matches: [] }, { status: 400 });
  }

  try {
    const identityUrl = new URL(`${IDENTITY_SERVICE_URL}/api/v1/matches/${userId}`);
    identityUrl.searchParams.set('status', status);
    identityUrl.searchParams.set('limit', limit.toString());

    const response = await fetch(identityUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Identity service returned ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('[Matches API] Error fetching matches:', error);
    // Fallback to empty matches if service unavailable
    return Response.json({
      matches: [],
      total: 0,
      status,
      generatedAt: new Date().toISOString(),
    });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const userId = url.searchParams.get('userId');

  // POST /api/dashboard/matches/:matchId/unmatch
  if (path.includes('/unmatch')) {
    const matchId = path.split('/').slice(-2, -1)[0];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = await request.json();

    console.log('[Matches API] Unmatch called for:', { matchId, userId });

    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 });
    }

    try {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/matches/${userId}/unmatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) {
        throw new Error(`Identity service returned ${response.status}`);
      }

      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      console.error('[Matches API] Error unmatching:', error);
      return Response.json({ error: 'Failed to unmatch', success: false }, { status: 500 });
    }
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const userId = url.searchParams.get('userId');

  // DELETE /api/dashboard/matches/:matchId/block
  if (path.includes('/block')) {
    const blockedUserId = path.split('/').slice(-2, -1)[0];
    const matchId = url.searchParams.get('matchId');

    console.log('[Matches API] Block called for:', { matchId, blockedUserId, userId });

    if (!userId || !matchId) {
      return Response.json({ error: 'userId and matchId required' }, { status: 400 });
    }

    try {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/matches/${userId}/block`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, blockedUserId }),
      });

      if (!response.ok) {
        throw new Error(`Identity service returned ${response.status}`);
      }

      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      console.error('[Matches API] Error blocking user:', error);
      return Response.json({ error: 'Failed to block', success: false }, { status: 500 });
    }
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
