import type { MatchCandidate } from '@/lib/api-types';
import { BACKEND_CONFIG, getBackendUrl } from '@/lib/backend-config';

// Sample match candidates with diverse profiles and statuses
const ALL_MATCH_CANDIDATES: MatchCandidate[] = [
  {
    id: 'match-1',
    displayName: 'Sarah',
    bio: 'Artist & gallery curator. Love rooftop art walks and vintage markets.',
    city: 'Brooklyn',
    cityRegion: 'Williamsburg',
    distanceKm: 2,
    photos: [
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 92,
    matchPreferences: ['women', 'everyone'],
    orientation: 'queer',
    discoverySpace: 'lgbtq',
  },
  {
    id: 'match-2',
    displayName: 'David',
    bio: 'Product manager, rock climber, and coffee enthusiast. New to Brooklyn.',
    city: 'Manhattan',
    cityRegion: 'Upper West Side',
    distanceKm: 4,
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: false,
    compatibilityScore: 84,
    matchPreferences: ['women'],
    orientation: 'straight',
    discoverySpace: 'both',
  },
  {
    id: 'match-3',
    displayName: 'Kayla',
    bio: 'Yoga instructor, plant lover, and always up for spontaneous adventures.',
    city: 'Brooklyn',
    cityRegion: 'Park Slope',
    distanceKm: 3,
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 88,
    matchPreferences: ['men', 'women', 'everyone'],
    orientation: 'bisexual',
    discoverySpace: 'both',
  },
  {
    id: 'match-4',
    displayName: 'Jordan',
    bio: 'Designer, music producer, and dog parent. Obsessed with indie films.',
    city: 'Long Island City',
    cityRegion: 'Long Island City',
    distanceKm: 5,
    photos: [
      'https://images.unsplash.com/photo-1535308033857-f5efd3f6e1fd?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 79,
    matchPreferences: ['men'],
    orientation: 'gay',
    discoverySpace: 'lgbtq',
  },
  {
    id: 'match-5',
    displayName: 'Alex',
    bio: 'Chef, travel blogger, and wine connoisseur. Planning a Europe trip!',
    city: 'Manhattan',
    cityRegion: 'SoHo',
    distanceKm: 3,
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: false,
    compatibilityScore: 81,
    matchPreferences: ['women'],
    orientation: 'straight',
    discoverySpace: 'both',
  },
  {
    id: 'match-6',
    displayName: 'Morgan',
    bio: 'Architect, book lover, and coffee shop regular. Sarcasm fluent.',
    city: 'Brooklyn',
    cityRegion: 'DUMBO',
    distanceKm: 2,
    photos: [
      'https://images.unsplash.com/photo-1517046220202-51e0e8b2236c?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 89,
    matchPreferences: ['women'],
    orientation: 'lesbian',
    discoverySpace: 'lgbtq',
  },
  {
    id: 'match-7',
    displayName: 'Taylor',
    bio: 'Fitness coach, nature enthusiast, and board game lover.',
    city: 'Astoria',
    cityRegion: 'Astoria',
    distanceKm: 6,
    photos: [
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 77,
    matchPreferences: ['men', 'women'],
    orientation: 'pansexual',
    discoverySpace: 'both',
  },
  {
    id: 'match-8',
    displayName: 'Casey',
    bio: 'Software engineer, podcast host, and amateur chef. Perpetually learning.',
    city: 'Manhattan',
    cityRegion: 'East Village',
    distanceKm: 3,
    photos: [
      'https://images.unsplash.com/photo-1519763185298-1b50fbc2e8fa?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: false,
    compatibilityScore: 82,
    matchPreferences: ['men'],
    orientation: 'gay',
    discoverySpace: 'lgbtq',
  },
  {
    id: 'match-9',
    displayName: 'Riley',
    bio: 'Teacher, dancer, and community organizer. Passionate about social justice.',
    city: 'Brooklyn',
    cityRegion: 'Sunset Park',
    distanceKm: 4,
    photos: [
      'https://images.unsplash.com/photo-1506933691698-22db21d57c29?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: true,
    compatibilityScore: 85,
    matchPreferences: ['women', 'men'],
    orientation: 'bisexual',
    discoverySpace: 'both',
  },
  {
    id: 'match-10',
    displayName: 'Sam',
    bio: 'Photographer, traveler, and storyteller. Always up for spontaneous road trips.',
    city: 'Manhattan',
    cityRegion: 'Hell\'s Kitchen',
    distanceKm: 3,
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    ],
    isVerified: false,
    compatibilityScore: 80,
    matchPreferences: ['women', 'everyone'],
    orientation: 'queer',
    discoverySpace: 'lgbtq',
  },
];

/**
 * GET /api/dashboard/matches
 * Returns a list of match candidates
 * Query params:
 *  - userId: Filter by user ID (optional)
 *  - limit: Number of matches to return (default 12)
 *  - status: 'new', 'active', 'expiring', 'archived' (optional)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const limit = parseInt(url.searchParams.get('limit') ?? '12', 10);
  const status = url.searchParams.get('status');

  // Try to fetch from real backend first
  if (BACKEND_CONFIG.ENABLE_REAL_MATCHES && userId && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
    try {
      let backendUrl = getBackendUrl(`/api/v1/matches/${userId}?limit=${limit}`);
      if (status) {
        backendUrl += `&status=${status}`;
      }
      const res = await fetch(backendUrl, { cache: 'no-store' });
      if (res.ok) {
        const backendData = await res.json();
        return Response.json({
          candidates: backendData.candidates ?? backendData ?? [],
          total: backendData.total ?? backendData?.length ?? 0,
          hasMore: backendData.hasMore ?? false,
          generatedAt: backendData.generatedAt ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch from identity service, falling back to stubs:', error);
    }
  }

  // Fallback to stub data
  let candidates = [...ALL_MATCH_CANDIDATES];

  if (status) {
    // Filter by status if provided
    // In a real app, this would be stored on the match object
    // For now, we'll just slice them
    if (status === 'new' && candidates.length > 0) {
      candidates = [candidates[0]]; // Just the first one for demo
    } else if (status === 'active' && candidates.length > 1) {
      candidates = candidates.slice(1, 3); // Next 2
    }
  }

  const result = candidates.slice(0, limit);

  return Response.json({
    candidates: result,
    total: result.length,
    hasMore: result.length < ALL_MATCH_CANDIDATES.length,
    generatedAt: new Date().toISOString(),
  });
}
