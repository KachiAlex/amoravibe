import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') ?? 'local-user';

  const snapshot = {
    devices: [],
    user: {
      id: userId,
      displayName: 'Local User',
      isVerified: false,
      trustScore: 42,
      photos: [],
    },
  };

  return NextResponse.json(snapshot);
}
