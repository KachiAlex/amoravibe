import type { MessagingThread, MessagingStatusTone } from '@lovedate/api';

interface ThreadPersona {
  id: string;
  name: string;
  avatar: string;
  route: string;
  snippetPool: string[];
  vibeHooks: string[];
}

const PERSONAS: ThreadPersona[] = [
  {
    id: 'sarah-ori',
    name: 'Sarah',
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    route: '/messages/sarah',
    snippetPool: [
      'Loved your take on rooftop vinyl nights.',
      'Sneaking you the guestlist link for Friday.',
      'Still laughing about the synthwave DJ you recommended.',
    ],
    vibeHooks: [
      'Gallery crawl invites pending.',
      'Analog film swap later tonight?',
      'Rooftop after-party planning thread.',
    ],
  },
  {
    id: 'david-new',
    name: 'David',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: '/messages/david',
    snippetPool: [
      'Ready for the gallery hop later?',
      'I booked us into the chef’s table—confirm?',
      'Sent you that VR art exhibit link.',
    ],
    vibeHooks: [
      'Needs confirmation for Saturday plans.',
      'Café scouting with Polaroids.',
      'Voice noted you skyline ideas.',
    ],
  },
  {
    id: 'kayla-travel',
    name: 'Kayla',
    avatar:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    route: '/messages/kayla',
    snippetPool: [
      'Just sent over café options ☕️',
      'Still down for sunrise yoga before flights?',
      'Packing list swap? I found a dreamy riad.',
    ],
    vibeHooks: [
      'Travel buddies in planning mode.',
      'Curating a “72 hours in Lisbon” docket.',
      'Comparing matcha tasting notes.',
    ],
  },
  {
    id: 'lena-coffee',
    name: 'Lena',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    route: '/messages/lena',
    snippetPool: [
      'Raincheck or still up for matcha?',
      'Chef’s kiss playlist incoming.',
      'You free to co-host the supper club intro?',
    ],
    vibeHooks: [
      'Testing mocktails with you in mind.',
      'Spontaneous ceramics session brewing.',
      'Needs RSVP on the supper club idea.',
    ],
  },
  {
    id: 'amir-design',
    name: 'Amir',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: '/messages/amir',
    snippetPool: [
      'Shared a playlist with you.',
      'Prototype drop at noon—want sneak peek?',
      'Got dumpling tour intel for us.',
    ],
    vibeHooks: [
      'Design sprint date night energy.',
      'Climbing gym double date forming.',
      'Voice noted you a beat sample.',
    ],
  },
  {
    id: 'noah-climb',
    name: 'Noah',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    route: '/messages/noah',
    snippetPool: [
      'Bouldering meetup still on?',
      'Sent the topo map—ready for sunrise trek?',
      'Have you tried that new plant shop café?',
    ],
    vibeHooks: [
      'Loves trading training playlists.',
      'Wants to co-host an outdoorsy meetup.',
      'Planning a slow brunch after climb.',
    ],
  },
  {
    id: 'priya-sonic',
    name: 'Priya',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    route: '/messages/priya',
    snippetPool: [
      'Can I loop you into the sound bath invite?',
      'Think you’d crush at the poetry mic tonight.',
      'I left you a voice note with chord progressions.',
    ],
    vibeHooks: [
      'Sonic experiments queued.',
      'Glitter rave wardrobe check.',
      'Tea flight tasting at noon.',
    ],
  },
  {
    id: 'mateo-night',
    name: 'Mateo',
    avatar:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
    route: '/messages/mateo',
    snippetPool: [
      'Skyline picnic still happening?',
      'Dropped coordinates for the speakeasy.',
      'Need your film recs for midnight screening.',
    ],
    vibeHooks: [
      'Night market scouting mission.',
      'Philosophy walk rain plan needed.',
      'Mixologist lab night awaits.',
    ],
  },
];

const STATUS_VARIANTS: { label: string; tone: MessagingStatusTone }[] = [
  { label: 'Typing now', tone: 'violet' },
  { label: 'Shared a voice note', tone: 'rose' },
  { label: 'Awaiting your RSVP', tone: 'amber' },
  { label: 'Dropped a location pin', tone: 'emerald' },
  { label: 'Queued a mixtape', tone: 'violet' },
];

const QUICK_REPLY_LIBRARY: string[][] = [
  ['Confirm plans', 'Send vibe check', 'Drop emoji'],
  ['Share playlist', 'Send voice note', 'Pin location'],
  ['Suggest café', 'Pick outfit', 'Ask for rec'],
  ['Call tonight?', 'Reschedule', 'Send spark'],
  ['Keep it casual', 'Escalate plans', 'Share update'],
];

const RELATIVE_WINDOWS = [
  'Just now',
  '2m ago',
  '5m ago',
  '12m ago',
  '27m ago',
  '58m ago',
  '1h ago',
  '2h ago',
  'Last night',
];

function deterministicPick<T>(items: T[], seed: number): T {
  return items[(Math.abs(seed) + items.length) % items.length];
}

function hashUser(userId: string): number {
  if (!userId) {
    return 0;
  }
  return userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildThread(persona: ThreadPersona, laneIndex: number, hash: number): MessagingThread {
  const baseSeed = hash + laneIndex * 13 + persona.name.length;
  const snippet = deterministicPick(persona.snippetPool, baseSeed);
  const vibeLine = deterministicPick(persona.vibeHooks, baseSeed + 7);
  const status = deterministicPick(STATUS_VARIANTS, baseSeed + persona.id.length);
  const replies = deterministicPick(QUICK_REPLY_LIBRARY, baseSeed + 3);
  const lastActive = deterministicPick(RELATIVE_WINDOWS, baseSeed + 5);
  const unread = baseSeed % 4 === 0 ? 2 : baseSeed % 5 === 0 ? 1 : 0;

  return {
    id: persona.id,
    name: persona.name,
    snippet,
    vibeLine,
    lastActive,
    unread,
    avatar: persona.avatar,
    route: persona.route,
    status,
    quickReplies: replies,
  };
}

function rotateThreads(userId: string): MessagingThread[] {
  const hash = hashUser(userId);
  const offset = PERSONAS.length ? hash % PERSONAS.length : 0;
  return PERSONAS.map((_, index) => {
    const persona = PERSONAS[(offset + index) % PERSONAS.length];
    return buildThread(persona, index, hash);
  });
}

export function buildMessagingFallback(userId: string, limit = 6): MessagingThread[] {
  const rotated = rotateThreads(userId);
  return rotated.slice(0, limit);
}
