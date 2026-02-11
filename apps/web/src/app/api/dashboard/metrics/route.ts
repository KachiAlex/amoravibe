import { NextResponse } from 'next/server';

export async function GET() {
  // Mocked metrics for local preview. Replace with real backend integration later.
  const metrics = {
    matches: 42,
    activeChats: 7,
    profileViews: 198,
  };

  return NextResponse.json(metrics);
}
