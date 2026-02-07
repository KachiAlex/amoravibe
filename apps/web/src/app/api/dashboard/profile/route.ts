import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    // Try proxying to identity service if available, otherwise return a safe mock
    if (process.env.IDENTITY_SERVICE_URL) {
      if (action === 'public') {
        const resp = await fetch(`${process.env.IDENTITY_SERVICE_URL}/api/v1/profile/public?userId=${userId}`);
        if (resp.ok) return NextResponse.json(await resp.json());
      }

      if (action === 'private') {
        const resp = await fetch(`${process.env.IDENTITY_SERVICE_URL}/api/v1/profile/private?userId=${userId}`);
        if (resp.ok) return NextResponse.json(await resp.json());
      }
    }

    if (action === 'public') {
      return NextResponse.json({
        success: true,
        profile: {
          id: userId,
          displayName: 'Your Name',
          bio: '',
          location: '',
          photos: [],
          isVerified: false,
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (action === 'private') {
      return NextResponse.json({
        success: true,
        profile: {
          sexualOrientation: '',
          genderIdentity: '',
          pronouns: '',
          relationshipGoal: '',
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Profile API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
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

    if (process.env.IDENTITY_SERVICE_URL) {
      if (action === 'public') {
        const resp = await fetch(`${process.env.IDENTITY_SERVICE_URL}/api/v1/profile/public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...body }),
        });
        if (resp.ok) return NextResponse.json(await resp.json());
      }

      if (action === 'private') {
        const resp = await fetch(`${process.env.IDENTITY_SERVICE_URL}/api/v1/profile/private`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...body }),
        });
        if (resp.ok) return NextResponse.json(await resp.json());
      }
    }

    if (action === 'public') {
      return NextResponse.json({
        success: true,
        message: 'Public profile updated',
        profile: {
          id: userId,
          ...body,
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (action === 'private') {
      return NextResponse.json({
        success: true,
        message: 'Private profile updated',
        profile: body,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Profile API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
