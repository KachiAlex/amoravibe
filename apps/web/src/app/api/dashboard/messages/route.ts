import type { MessagingThread, MessagingStatusTone } from '@/lib/api-types';
import { BACKEND_CONFIG, getBackendUrl } from '@/lib/backend-config';

// NOTE: Minimal lint fix commit - ensures this file differs from older commits
// that contained an unused `NextResponse` import. Safe no-op comment.

// Sample messaging threads with diverse personas and statuses
const ALL_MESSAGE_THREADS: MessagingThread[] = [
  {
    id: 'thread-1',
    name: 'Sarah',
    snippet: 'Loved your take on rooftop vinyl nights.',
    vibeLine: 'Gallery crawl invites pending.',
    lastActive: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    route: '/messages/sarah',
    status: { label: 'Waiting for reply', tone: 'active' as MessagingStatusTone },
    quickReplies: ['Absolutely!', 'Tell me more', 'When?'],
  },
  {
    id: 'thread-2',
    name: 'David',
    snippet: 'I booked us into the chef\'s table—confirm?',
    vibeLine: 'Needs confirmation for Saturday plans.',
    lastActive: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: '/messages/david',
    status: { label: 'Waiting for you', tone: 'default' as MessagingStatusTone },
    quickReplies: ['Let me check', 'Sounds perfect!', 'Rain check?'],
  },
  {
    id: 'thread-3',
    name: 'Kayla',
    snippet: 'The botanical garden exhibit is insane. You need to see it.',
    vibeLine: 'Rare finds in the plant world.',
    lastActive: new Date(Date.now() - 24 * 3600000).toISOString(), // 24 hours ago
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    route: '/messages/kayla',
    status: { label: 'Online', tone: 'positive' as MessagingStatusTone },
    quickReplies: ['When are you going?', 'Send pics!', 'Meet there?'],
  },
  {
    id: 'thread-4',
    name: 'Jordan',
    snippet: 'Still laughing about the parkour incident last weekend.',
    vibeLine: 'Adventure buddy ready for round 2.',
    lastActive: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1535308033857-f5efd3f6e1fd?auto=format&fit=crop&w=200&q=80',
    route: '/messages/jordan',
    status: { label: 'Last active 3d ago', tone: 'inactive' as MessagingStatusTone },
    quickReplies: ['😂', 'Never again!', 'Let\'s plan something safer'],
  },
  {
    id: 'thread-5',
    name: 'Alex',
    snippet: 'Would love to finally meet for coffee this week.',
    vibeLine: 'New connection, mutual interests.',
    lastActive: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    route: '/messages/alex',
    status: { label: 'Waiting for you', tone: 'default' as MessagingStatusTone },
    quickReplies: ['Tuesday works', 'Friday night?', 'How about brunch?'],
  },
  {
    id: 'thread-6',
    name: 'Morgan',
    snippet: 'Just finished that book you recommended. Mind. Blown.',
    vibeLine: 'Book club member, deep conversations.',
    lastActive: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1517046220202-51e0e8b2236c?auto=format&fit=crop&w=200&q=80',
    route: '/messages/morgan',
    status: { label: 'Active now', tone: 'active' as MessagingStatusTone },
    quickReplies: ['Right?!', 'Let\'s discuss', 'Next book pick?'],
  },
];

/**
 * GET /api/dashboard/messages
 * Returns a paginated list of messaging threads
 * Query params:
 *  - userId: Filter by user ID (optional)
 *  - limit: Number of threads to return (default 6)
 *  - sort: 'recent' (default), 'unread', 'status'
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const limit = parseInt(url.searchParams.get('limit') ?? '6', 10);
  const sort = url.searchParams.get('sort') ?? 'recent';

  // Try to fetch from real backend first
  if (BACKEND_CONFIG.ENABLE_REAL_MESSAGING && userId && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
    try {
      const backendUrl = getBackendUrl(`/messaging/threads/${userId}?limit=${limit}`);
      const res = await fetch(backendUrl, { cache: 'no-store' });
      if (res.ok) {
        const backendData = await res.json();
        return Response.json({
          threads: backendData.threads ?? backendData ?? [],
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
  const threads = [...ALL_MESSAGE_THREADS];

  if (sort === 'unread') {
    threads.sort((a, b) => b.unread - a.unread);
  } else if (sort === 'status') {
    const statusOrder = { active: 0, positive: 1, default: 2, inactive: 3 };
    threads.sort((a, b) => statusOrder[a.status.tone as keyof typeof statusOrder] - statusOrder[b.status.tone as keyof typeof statusOrder]);
  } else {
    // 'recent' - sort by lastActive descending
    threads.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }

  const result = threads.slice(0, limit);

  return Response.json({
    threads: result,
    total: result.length,
    hasMore: result.length < ALL_MESSAGE_THREADS.length,
    generatedAt: new Date().toISOString(),
  });
}
