import { NextResponse } from 'next/server';

// Simple stub for the Home feed used during local development.
// Produces a deterministic feed shape matching docs/HOME-FEED-API.md

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') ?? 'local-user';
  const mode = (url.searchParams.get('mode') as string) ?? 'default';
  const limit = Number(url.searchParams.get('limit') ?? '12');

  const now = new Date().toISOString();

  const makeCard = (i: number) => ({
    id: `local-${userId}-card-${i}`,
    name: `Local User ${i}`,
    age: 20 + (i % 10),
    city: i % 2 === 0 ? 'San Francisco' : 'New York',
    cityRegion: i % 2 === 0 ? 'CA' : 'NY',
    distance: `${i + 1} km`,
    distanceKm: i + 1,
    tags: ['Coffee', 'Art'],
    image: `https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=60&ixid=${i}`,
    compatibility: 60 + (i % 40),
    verified: i % 5 === 0,
    premiumOnly: false,
    receiverId: `local-${userId}-card-${i}`,
    actionable: true,
  });

  const featured = [makeCard(1), makeCard(2)];
  const grid = Array.from({ length: Math.min(limit, 12) }, (_, i) => makeCard(i + 3));

  const feed = {
    hero: featured[0] ?? null,
    featured,
    grid,
    filters: [
      {
        label: 'Verified',
        value: 'verified',
        helper: 'Show verified profiles',
        premium: false,
        active: mode === 'verified',
      },
      {
        label: 'Nearby',
        value: 'nearby',
        helper: 'Close by',
        premium: false,
        active: mode === 'nearby',
      },
    ],
    total: 100,
    mode,
    generatedAt: now,
  };

  return NextResponse.json(feed);
}
