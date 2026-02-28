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
  },
];

const store: Record<string, { matches: Match[]; messages: Message[]; profile: Record<string, any>; settings: Record<string, any> }> = {};

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
        tags: ['Travel', 'Coffee', 'Design'],
      },
      settings: { emailNotifications: true },
    };
  }
  return store[userId];
}

export function getMatches(userId: string) {
  return ensure(userId).matches;
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
    profile: { displayName: userId, bio: 'This is your profile.' },
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
