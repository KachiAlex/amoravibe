import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Proxy to identity service subscription endpoint
    const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/subscription?userId=${userId}`);
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Subscription API GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Subscription API POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}
