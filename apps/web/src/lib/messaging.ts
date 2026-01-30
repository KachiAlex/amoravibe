export interface MessagingThread {
  id: string;
  name: string;
  snippet: string;
  lastActive: string;
  unread: number;
  avatar: string;
  route: string;
}

const SAMPLE_THREADS: MessagingThread[] = [
  {
    id: 'sarah-ori',
    name: 'Sarah',
    snippet: 'Loved your take on rooftop vinyl nights.',
    lastActive: '5m ago',
    unread: 1,
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    route: '/messages/sarah',
  },
  {
    id: 'david-new',
    name: 'David',
    snippet: 'Ready for the gallery hop later?',
    lastActive: '27m ago',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: '/messages/david',
  },
  {
    id: 'kayla-travel',
    name: 'Kayla',
    snippet: 'Just sent over café options ☕️',
    lastActive: '1h ago',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    route: '/messages/kayla',
  },
  {
    id: 'lena-coffee',
    name: 'Lena',
    snippet: 'Raincheck or still up for matcha?',
    lastActive: '2h ago',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    route: '/messages/lena',
  },
  {
    id: 'amir-design',
    name: 'Amir',
    snippet: 'Shared a playlist with you.',
    lastActive: '4h ago',
    unread: 2,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: '/messages/amir',
  },
  {
    id: 'noah-climb',
    name: 'Noah',
    snippet: 'Bouldering meetup still on?',
    lastActive: '6h ago',
    unread: 0,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    route: '/messages/noah',
  },
];

function rotateThreads(userId: string): MessagingThread[] {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = hash % SAMPLE_THREADS.length;
  return new Array(SAMPLE_THREADS.length).fill(null).map((_, index) => {
    const thread = SAMPLE_THREADS[(offset + index) % SAMPLE_THREADS.length];
    return {
      ...thread,
      // Slightly vary timestamps by reusing the index to keep it deterministic.
      lastActive: thread.lastActive.includes('ago')
        ? thread.lastActive
        : `${(index + 1) * 15}m ago`,
    };
  });
}

export async function loadLocalThreads(userId: string, limit = 6): Promise<MessagingThread[]> {
  if (!userId) {
    return SAMPLE_THREADS.slice(0, limit);
  }

  const rotated = rotateThreads(userId);
  return rotated.slice(0, limit);
}
