import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lovedateApi } from '../apps/web/src/lib/api';

describe('lovedateApi.fetchDiscoverFeed', () => {
  const globalAny: any = global;

  beforeEach(() => {
    globalAny.fetch = vi.fn();
  });
  afterEach(() => {
    vi.resetAllMocks();
    delete globalAny.fetch;
  });

  it('calls the local /api/dashboard/discover and returns parsed json', async () => {
    const sample = {
      hero: {
        id: 'maya',
        name: 'Maya',
        age: 26,
        city: 'Manhattan, NY',
        distance: '0.5 mi',
        tags: ['Art', 'Coffee'],
        image: 'https://example.com/maya.jpg',
        compatibility: 92,
        verified: true,
        receiverId: 'maya',
        actionable: true,
      },
      featured: [],
      grid: [],
      filters: [],
      mode: 'verified',
      total: 1,
      generatedAt: new Date().toISOString(),
    };
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => sample });

    const res = await lovedateApi.fetchDiscoverFeed({ userId: 'u1', mode: 'verified', limit: 6 });
    expect(globalAny.fetch).toHaveBeenCalledWith(
      '/api/dashboard/discover?userId=u1&mode=verified&limit=6',
      expect.any(Object)
    );
    expect(res.mode).toBe('verified');
    expect(res.total).toBe(1);
    expect(res.hero).toBeDefined();
  });
});

describe('lovedateApi.likeUser', () => {
  const globalAny: any = global;

  beforeEach(() => {
    globalAny.fetch = vi.fn();
  });
  afterEach(() => {
    vi.resetAllMocks();
    delete globalAny.fetch;
  });

  it('posts to /api/user/action and returns success', async () => {
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const res = await lovedateApi.likeUser({ senderId: 's', receiverId: 'r', action: 'like' });
    expect(globalAny.fetch).toHaveBeenCalledWith('/api/user/action', expect.any(Object));
    expect(res.success).toBe(true);
  });
});

describe('lovedateApi.fetchMessagingThreads', () => {
  const globalAny: any = global;

  beforeEach(() => {
    globalAny.fetch = vi.fn();
  });
  afterEach(() => {
    vi.resetAllMocks();
    delete globalAny.fetch;
  });

  it('calls /api/dashboard/messages and returns threads array', async () => {
    const sample = {
      threads: [
        {
          id: 'thread-1',
          name: 'Sarah',
          snippet: 'Loved your take on rooftop vinyl nights.',
          vibeLine: 'Gallery crawl invites pending.',
          lastActive: new Date().toISOString(),
          unread: 2,
          avatar: 'https://example.com/sarah.jpg',
          route: '/messages/sarah',
          status: { label: 'Waiting for reply', tone: 'active' },
          quickReplies: ['Absolutely!', 'Tell me more'],
        },
      ],
      total: 1,
      hasMore: false,
    };
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => sample });

    const res = await lovedateApi.fetchMessagingThreads('user-123', 6);
    expect(globalAny.fetch).toHaveBeenCalledWith(
      '/api/dashboard/messages?userId=user-123&limit=6',
      expect.any(Object)
    );
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Sarah');
  });

  it('returns empty array on error', async () => {
    (globalAny.fetch as any).mockRejectedValue(new Error('Network error'));

    const res = await lovedateApi.fetchMessagingThreads('user-123');
    expect(res).toEqual([]);
  });
});
