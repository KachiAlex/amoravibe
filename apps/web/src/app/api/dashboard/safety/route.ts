import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';

const mapModerationAction = (action: string) => {
  switch (action) {
    case 'temporary_restriction':
      return 'restricted';
    case 'permanent_ban':
      return 'banned';
    default:
      return action;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const reportId = searchParams.get('reportId');
    const limit = searchParams.get('limit') || '10';
    const skip = searchParams.get('skip') || '0';

    if (action === 'experience') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/experience?userId=${userId}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'blocked-users') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/blocked-users?userId=${userId}&limit=${limit}&skip=${skip}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'is-blocked') {
      const blockedId = searchParams.get('blockedId');
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/is-blocked?userId=${userId}&blockedId=${blockedId}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'reports') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/reports?userId=${userId}&limit=${limit}&skip=${skip}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'tools') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/tools?userId=${userId}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'report-status' && reportId) {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/report/${reportId}`);
      return NextResponse.json(await response.json());
    }

    if (action === 'moderation-logs') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/moderation-logs?userId=${userId}&limit=${limit}&skip=${skip}`,
      );
      return NextResponse.json(await response.json());
    }

    if (action === 'moderation-outcomes') {
      const response = await fetch(
        `${IDENTITY_SERVICE_URL}/api/v1/safety/moderation-logs?userId=${userId}&limit=${limit}&skip=${skip}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        return NextResponse.json(payload, { status: response.status });
      }

      const rawLogs = payload.logs ?? payload.data ?? [];
      const outcomes = rawLogs.map((log: any) => ({
        id: log.id,
        action: mapModerationAction(log.action),
        reason: log.reason,
        severity: log.severity,
        createdAt: log.createdAt,
        expiresAt: log.expiresAt,
      }));

      return NextResponse.json({ outcomes, total: payload.total ?? outcomes.length });
    }

    if (action === 'profile-health') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/profile-health?userId=${userId}`);
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Safety API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch safety data' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const body = await request.json();

    if (action === 'report') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          ...body,
        }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'block') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'unblock') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'update-health') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/profile-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'log-moderation') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/moderation-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'emergency-contact') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/emergency-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      return NextResponse.json(await response.json());
    }

    if (action === 'location-sharing') {
      const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/safety/location-sharing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Safety API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 },
    );
  }
}
