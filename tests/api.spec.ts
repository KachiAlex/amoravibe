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
