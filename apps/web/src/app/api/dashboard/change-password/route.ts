import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.IDENTITY_SERVICE_URL) {
      return NextResponse.json({ success: true, message: 'Password change simulated.' });
    }

    const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Change password route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 },
    );
  }
}
