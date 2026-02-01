import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lovedateApi } from '../api';

const sampleFeed = {
  hero: { id: 'h1', name: 'Hero' },
  featured: [{ id: 'f1', name: 'F1' }],
  grid: [{ id: 'g1', name: 'G1' }],
  filters: [],
  total: 3,
  mode: 'default',
  generatedAt: new Date().toISOString(),
};

describe('lovedateApi.fetchDiscoverFeed', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls the local endpoint and returns parsed json', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => sampleFeed }) as any);
    const res = await lovedateApi.fetchDiscoverFeed({
      userId: 'user-x',
      mode: 'default',
      limit: 6,
    });
    expect(res).toBeDefined();
    expect(res.grid).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('returns fallback on fetch error', async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500 }) as any);
    const res = await lovedateApi.fetchDiscoverFeed({ userId: 'user-x' });
    expect(res).toBeDefined();
    expect(res.grid).toEqual([]);
  });
});

describe('lovedateApi.likeUser', () => {
  let originalFetch: any;
  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('posts to /api/user/action and returns success', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) }) as any);
    const res = await lovedateApi.likeUser({ senderId: 'a', receiverId: 'b', action: 'like' });
    expect(res.success).toBe(true);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('returns failure shape on server error', async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500 }) as any);
    const res = await lovedateApi.likeUser({ senderId: 'a', receiverId: 'b', action: 'like' });
    expect(res.success).toBe(false);
  });
});
