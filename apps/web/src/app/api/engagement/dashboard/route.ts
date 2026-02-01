import { NextResponse } from 'next/server';

export async function GET() {
  const response = {
    receivedLikes: [],
    sentLikes: [],
    notificationPreferences: [
      { channel: 'push', label: 'Push notifications', helper: 'Instant alerts', enabled: true },
    ],
    premiumPerks: [],
    safetyResources: [],
    settingsShortcuts: [],
    discoverFilters: [],
  };

  return NextResponse.json(response);
}
