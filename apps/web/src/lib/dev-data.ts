type Match = {
  id: string;
  name: string;
  avatar: string;
  tagline?: string;
  matchPercent?: number;
  accepted?: boolean;
};

type Message = {
  id: string;
  from: string;
  to?: string;
  avatar?: string;
  preview?: string;
  text?: string;
  time?: string;
};

const seedMatches: Match[] = [
  { id: '1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', tagline: 'Loves coffee and sunsets', matchPercent: 95 },
  { id: '2', name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', tagline: 'Photographer', matchPercent: 92 },
];

const seedMessages: Message[] = [
  { id: 'm1', from: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', preview: 'Hey! Want to grab coffee?', text: 'Hey! Want to grab coffee?', time: '2h' },
];

const store: Record<string, { matches: Match[]; messages: Message[]; profile: Record<string, any>; settings: Record<string, any> }> = {};

function ensure(userId: string) {
  if (!store[userId]) {
    store[userId] = {
      matches: JSON.parse(JSON.stringify(seedMatches)),
      messages: JSON.parse(JSON.stringify(seedMessages)),
      profile: { displayName: userId, bio: 'This is your profile.' },
      settings: { emailNotifications: true },
    };
  }
  return store[userId];
}

export function getMatches(userId: string) {
  return ensure(userId).matches;
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
