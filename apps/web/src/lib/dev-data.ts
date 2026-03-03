type Match = {
  id: string;
  name: string;
  avatar: string;
  tagline?: string;
  matchPercent?: number;
  accepted?: boolean;
  city?: string;
  role?: string;
  tags?: string[];
  photos?: string[];
  orientation?: string;
  lat?: number;
  lng?: number;
};

type Profile = {
  displayName: string;
  bio?: string;
  orientation?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  city?: string;
};

export type Message = {
  id: string;
  from: string;
  to?: string;
  avatar?: string;
  preview?: string;
  text?: string;
  time?: string;
  unread?: boolean;
  online?: boolean;
  typing?: boolean;
  muted?: boolean;
  archived?: boolean;
};

const seedMatches: Match[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80'],
    tagline: 'Loves coffee and sunsets',
    role: 'UX Designer',
    city: 'San Francisco, CA',
    tags: ['Travel', 'Design', 'Coffee'],
    matchPercent: 95,
    orientation: 'heterosexual',
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    photos: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
    tagline: 'Tech geek who loves hiking and good food',
    role: 'Software Engineer',
    city: 'Los Angeles, CA',
    tags: ['Technology', 'Hiking', 'Food'],
    matchPercent: 92,
    orientation: 'heterosexual',
    lat: 34.0522,
    lng: -118.2437,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80'],
    tagline: 'Fitness enthusiast and brunch expert',
    role: 'Marketing Manager',
    city: 'New York, NY',
    tags: ['Fitness', 'Brunch', 'Travel'],
    matchPercent: 88,
    orientation: 'heterosexual',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: '4',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80'],
    tagline: 'Capturing moments and exploring new places',
    role: 'Photographer',
    city: 'Chicago, IL',
    tags: ['Photography', 'Outdoors', 'Foodie'],
    matchPercent: 90,
    orientation: 'heterosexual',
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: '5',
    name: 'Aisha Bello',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    photos: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80'],
    tagline: 'Book club host',
    role: 'Product Manager',
    city: 'Austin, TX',
    tags: ['Books', 'Coffee', 'Podcasts'],
    matchPercent: 90,
    orientation: 'heterosexual',
    lat: 30.2672,
    lng: -97.7431,
  },
];

const seedMessages: Message[] = [
  {
    id: 'm1',
    from: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    preview: 'That sounds amazing! I’d love to...',
    text: 'That sounds amazing! I’d love to grab coffee and catch the sunset this week. Are you free Thursday?',
    time: '2m',
    unread: true,
    online: true,
    typing: true,
  },
  {
    id: 'm2',
    from: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    preview: 'See you tomorrow! 😊',
    text: 'See you tomorrow at the art walk! Looking forward to it 😊',
    time: '1h',
    unread: false,
    online: true,
    muted: true,
  },
  {
    id: 'm3',
    from: 'Emma Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    preview: 'Brunch plans?',
    text: 'Brunch plans this weekend? There’s a new spot I want to try.',
    time: '3h',
    unread: true,
    online: false,
    archived: true,
  },
  {
    id: 'm4',
    from: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    preview: 'Check out this photo',
    text: 'Check out this photo from my last trip—think you’d like this hike!',
    time: '1d',
    unread: false,
    online: false,
    muted: false,
    archived: true,
  },
];

const store: Record<string, { matches: Match[]; messages: Message[]; profile: Profile; settings: Record<string, any> }> = {};

const MAX_DISTANCE_KM = 2000;
const LOCATION_WEIGHT = 0.5;
const INTEREST_WEIGHT = 0.35;
const ORIENTATION_WEIGHT = 0.15;

function deg2rad(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(a: { lat?: number; lng?: number }, b: { lat?: number; lng?: number }) {
  if (
    typeof a.lat !== 'number' ||
    typeof a.lng !== 'number' ||
    typeof b.lat !== 'number' ||
    typeof b.lng !== 'number'
  ) {
    return null;
  }
  const earthRadiusKm = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * c;
}

function normalizeLocationScore(user: Profile, candidate: Match) {
  const dist = distanceKm(user, candidate);
  if (dist === null) {
    return 0.6; // neutral default if we cannot compute distance
  }
  const clamped = Math.min(dist, MAX_DISTANCE_KM);
  return 1 - clamped / MAX_DISTANCE_KM;
}

function normalizeInterestScore(user: Profile, candidate: Match) {
  const userTags = user.tags ?? [];
  const candidateTags = candidate.tags ?? [];
  if (userTags.length === 0 || candidateTags.length === 0) {
    return 0.4;
  }
  const overlap = candidateTags.filter((tag) => userTags.includes(tag)).length;
  const denominator = Math.max(userTags.length, candidateTags.length);
  return overlap / denominator;
}

function normalizeOrientationScore(user: Profile, candidate: Match) {
  if (!user.orientation || !candidate.orientation) return 0.5;
  return user.orientation.toLowerCase() === candidate.orientation.toLowerCase() ? 1 : 0;
}

function scoreCandidate(user: Profile, candidate: Match) {
  const locationScore = normalizeLocationScore(user, candidate);
  const interestScore = normalizeInterestScore(user, candidate);
  const orientationScore = normalizeOrientationScore(user, candidate);
  const composite =
    locationScore * LOCATION_WEIGHT +
    interestScore * INTEREST_WEIGHT +
    orientationScore * ORIENTATION_WEIGHT;
  return {
    score: composite,
    breakdown: { locationScore, interestScore, orientationScore },
  };
}

function ensure(userId: string) {
  if (!store[userId]) {
    store[userId] = {
      matches: JSON.parse(JSON.stringify(seedMatches)),
      messages: JSON.parse(JSON.stringify(seedMessages)),
      profile: {
        displayName: userId,
        bio: 'This is your profile.',
        orientation: 'heterosexual',
        lat: 37.7749,
        lng: -122.4194,
        city: 'San Francisco, CA',
        tags: ['Travel', 'Coffee', 'Design'],
      },
      settings: { emailNotifications: true },
    };
  }
  return store[userId];
}

function getOrSeedUser(userId: string) {
  const profile = ensure(userId).profile;
  if (!profile.lat || !profile.lng) {
    // fallback to default SF coordinates to make distance scoring deterministic
    profile.lat = 37.7749;
    profile.lng = -122.4194;
  }
  return ensure(userId);
}

export function getMatches(userId: string) {
  const { matches, profile } = ensure(userId);
  return matches
    .map((match) => {
      const { score } = scoreCandidate(profile, match);
      return {
        ...match,
        matchPercent: Math.max(match.matchPercent ?? 0, Math.round(score * 100)),
        _score: score,
      };
    })
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...rest }) => rest);
}

export function getProfile(userId: string) {
  return ensure(userId).profile;
}

export function getMessages(userId: string) {
  return ensure(userId).messages;
}

export function postMessage(userId: string, payload: { to?: string; text: string }) {
  const msg = {
    id: `m${Date.now()}`,
    from: userId,
    to: payload.to || 'unknown',
    text: payload.text,
    preview: payload.text.slice(0, 120),
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    time: 'now',
  };
  ensure(userId).messages.unshift(msg);
  return msg;
}

export function acceptMatch(userId: string, matchId: string) {
  const m = ensure(userId).matches.find((x) => x.id === matchId);
  if (m) m.accepted = true;
  return m;
}

export function updateProfile(userId: string, data: Record<string, any>) {
  const profile = ensure(userId).profile;
  Object.assign(profile, data);
  return profile;
}

export function updateSettings(userId: string, data: Record<string, any>) {
  const settings = ensure(userId).settings;
  Object.assign(settings, data);
  return settings;
}

// E2E helpers
export function seedUser(userId: string) {
  // replace store entry for userId with fresh seed copies
  store[userId] = {
    matches: JSON.parse(JSON.stringify(seedMatches)),
    messages: JSON.parse(JSON.stringify(seedMessages)),
    profile: {
      displayName: userId,
      bio: 'This is your profile.',
      orientation: 'heterosexual',
      lat: 37.7749,
      lng: -122.4194,
      city: 'San Francisco, CA',
      tags: ['Travel', 'Coffee', 'Design'],
    },
    settings: { emailNotifications: true },
  };
  return store[userId];
}

export function seedUsers(userIds: string[]) {
  return userIds.map((id) => seedUser(id));
}

export function clearStore() {
  for (const k of Object.keys(store)) delete store[k];
}
