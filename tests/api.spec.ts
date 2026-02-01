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

  it('calls the local /api/dashboard/home and returns parsed json', async () => {
    const sample = {
      hero: null,
      featured: [],
      grid: [],
      filters: [],
      total: 0,
      mode: 'default',
      generatedAt: new Date().toISOString(),
    };
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => sample });

    const res = await lovedateApi.fetchDiscoverFeed({ userId: 'u1', mode: 'default', limit: 6 });
    expect(globalAny.fetch).toHaveBeenCalled();
    expect(res.mode).toBe('default');
    expect(res.total).toBe(0);
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
