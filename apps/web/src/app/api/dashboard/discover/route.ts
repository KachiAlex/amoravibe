import type { DiscoverCard, DiscoverFeedMode, DiscoverFeedResponse } from '@/lib/api-types';
import { BACKEND_CONFIG, getBackendUrl } from '@/lib/backend-config';

// NOTE: Minimal lint fix commit - ensures this file differs from older commits
// that contained an unused `NextResponse` import. Safe no-op comment.

// Sample discover cards with mode-specific filtering
const ALL_DISCOVER_CARDS: DiscoverCard[] = [
  {
    id: 'maya',
    name: 'Maya',
    age: 26,
    city: 'Manhattan, NY',
    cityRegion: 'Manhattan',
    distance: '0.5 mi',
    distanceKm: 1,
    tags: ['Art', 'Coffee', 'Yoga'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    compatibility: 92,
    verified: true,
    premiumOnly: false,
    receiverId: 'maya',
    actionable: true,
  },
  {
    id: 'sophia',
    name: 'Sophia',
    age: 28,
    city: 'Chelsea, NY',
    cityRegion: 'Chelsea',
    distance: '1.2 mi',
    distanceKm: 2,
    tags: ['Music', 'Travel', 'Food'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    compatibility: 88,
    verified: true,
    premiumOnly: false,
    receiverId: 'sophia',
    actionable: true,
  },
  {
    id: 'jessica',
    name: 'Jessica',
    age: 25,
    city: 'Lower East Side, NY',
    cityRegion: 'Lower East Side',
    distance: '2 mi',
    distanceKm: 3,
    tags: ['Photography', 'Hiking', 'Reading'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    compatibility: 85,
    verified: true,
    premiumOnly: false,
    receiverId: 'jessica',
    actionable: true,
  },
  {
    id: 'emma',
    name: 'Emma',
    age: 27,
    city: 'Crown Heights, BK',
    cityRegion: 'Brooklyn',
    distance: '3.5 mi',
    distanceKm: 6,
    tags: ['Tech', 'Fitness', 'Cooking'],
    image: 'https://images.unsplash.com/photo-1517046220202-51e0e8b2236c?auto=format&fit=crop&w=900&q=80',
    compatibility: 82,
    verified: false,
    premiumOnly: false,
    receiverId: 'emma',
    actionable: true,
  },
  {
    id: 'olivia',
    name: 'Olivia',
    age: 24,
    city: 'Williamsburg, BK',
    cityRegion: 'Brooklyn',
    distance: '4 mi',
    distanceKm: 6.5,
    tags: ['Fashion', 'Art', 'Music'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    compatibility: 79,
    verified: true,
    premiumOnly: true,
    receiverId: 'olivia',
    actionable: true,
  },
  {
    id: 'amelia',
    name: 'Amelia',
    age: 29,
    city: 'Park Slope, BK',
    cityRegion: 'Brooklyn',
    distance: '5 mi',
    distanceKm: 8,
    tags: ['Nature', 'Writing', 'Travel'],
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
    compatibility: 81,
    verified: true,
    premiumOnly: false,
    receiverId: 'amelia',
    actionable: true,
  },
];

const DEFAULT_FILTERS: DiscoverFeedResponse['filters'] = [
  { label: 'All', value: 'default' },
  { label: 'Verified', value: 'verified' },
  { label: 'Nearby', value: 'nearby' },
  { label: 'Fresh', value: 'fresh' },
  { label: 'Premium', value: 'premium' },
  { label: 'Shared Interests', value: 'shared' },
];

const mapBackendProfileToCard = (profile: any): DiscoverCard => {
  const firstPhoto = Array.isArray(profile?.photos) ? profile.photos[0] : null;

  return {
    id: profile?.id ?? 'unknown',
    name: profile?.displayName ?? profile?.name ?? 'Member',
    age: profile?.age ?? null,
    city: profile?.city ?? null,
    cityRegion: profile?.cityRegion ?? null,
    distance: profile?.distance ?? null,
    distanceKm: typeof profile?.distanceKm === 'number' ? profile.distanceKm : null,
    tags: profile?.tags ?? [],
    image: firstPhoto ?? profile?.image ?? null,
    compatibility: profile?.compatibility,
    verified: Boolean(profile?.verified),
    premiumOnly: Boolean(profile?.premiumOnly),
    receiverId: profile?.receiverId ?? profile?.id,
    actionable: profile?.actionable ?? true,
  };
};

function filterCardsByMode(cards: DiscoverCard[], mode: string | null): DiscoverCard[] {
  if (!mode) return cards;

  switch (mode) {
    case 'verified':
      return cards.filter((c) => c.verified);
    case 'nearby':
      return cards.filter((c) => {
        const km = c.distanceKm ?? 999;
        return km <= 5;
      });
    case 'fresh':
      // Simulate new/freshly onboarded by showing youngest first
      return [...cards].sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
    case 'premium':
      return cards.filter((c) => c.premiumOnly || c.verified);
    case 'shared':
      // Simulate shared interests by picking cards with overlapping tags
      return cards.filter((c) => c.tags && c.tags.length > 0);
    default:
      return cards;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const mode = url.searchParams.get('mode') ?? 'default';
  const limit = parseInt(url.searchParams.get('limit') ?? '12', 10);

  // Try to fetch from real backend first
  if (BACKEND_CONFIG.ENABLE_REAL_DISCOVER && userId && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
    try {
      const backendUrl = getBackendUrl(
        `/discovery/feed?userId=${encodeURIComponent(userId)}&mode=${encodeURIComponent(mode)}&limit=${limit}`
      );
      const res = await fetch(backendUrl, { cache: 'no-store' });
      if (res.ok) {
        const backendData = await res.json();
        const backendGrid = Array.isArray(backendData?.grid) ? backendData.grid : [];
        const mappedGrid = backendGrid.map(mapBackendProfileToCard).slice(0, limit);
        const filters = backendData?.filters?.length ? backendData.filters : DEFAULT_FILTERS;

        // Ensure we return a complete feed shape even when backend omits hero/featured
        return Response.json({
          hero: backendData?.hero ?? mappedGrid[0] ?? null,
          featured: backendData?.featured?.length
            ? backendData.featured.map(mapBackendProfileToCard)
            : mappedGrid.slice(0, 2),
          grid: mappedGrid,
          filters,
          mode: (backendData?.mode as DiscoverFeedMode) ?? (mode as DiscoverFeedMode),
          total: backendData?.total ?? mappedGrid.length,
          generatedAt: backendData.generatedAt ?? new Date().toISOString(),
        });
      }
      // eslint-disable-next-line no-console
      console.error('Identity service discover feed returned non-200', res.status);
    } catch (error) {
      console.error('Failed to fetch from identity service, falling back to stubs:', error);
    }
  }

  // Fallback to stub data
  const filtered = filterCardsByMode(ALL_DISCOVER_CARDS, mode).slice(0, limit);

  const response: DiscoverFeedResponse = {
    hero: filtered.length > 0 ? filtered[0] : null,
    featured: filtered.slice(0, 2),
    grid: filtered,
    filters: DEFAULT_FILTERS,
    mode: mode as any,
    total: filtered.length,
    generatedAt: new Date().toISOString(),
  };

  return Response.json(response);
}
