import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
  profileVisibility: 'verified_only',
  discoveryPreference: 'everywhere',
  allowMessages: true,
  showOnlineStatus: true,
  allowAnalytics: true,
  whoCanSeeMe: 'everyone',
  whoCanMessageMe: 'matches',
  communityVisibility: 'public',
  ageRange: [23, 38],
  maxDistanceMiles: 30,
  intentPreferences: ['dating'],
  dealbreakers: ['No smokers', 'No political talk'],
  twoFactorEnabled: true,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'settings';

    if (action === 'subscription') {
      return NextResponse.json({
        success: true,
        subscription: {
          status: 'inactive',
          plan: 'free',
        },
      });
    }

    if (action === 'settings') {
      if (process.env.IDENTITY_SERVICE_URL) {
        const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/settings?userId=${userId}`);
        if (response.ok) {
          return NextResponse.json(await response.json());
        }
      }
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        contactEmail: null,
        phoneNumber: null,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Settings API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'settings';
    const body = await request.json();

    if (action === 'settings') {
      if (process.env.IDENTITY_SERVICE_URL) {
        const response = await fetch(`${IDENTITY_SERVICE_URL}/api/v1/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return NextResponse.json(await response.json(), { status: response.status });
      }

      return NextResponse.json({
        success: true,
        message: 'Settings saved',
        settings: body.settings ?? DEFAULT_SETTINGS,
        contactEmail: body.contactEmail ?? null,
        phoneNumber: body.phoneNumber ?? null,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Settings API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 },
    );
  }
}
