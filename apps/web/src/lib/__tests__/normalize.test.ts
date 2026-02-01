import { describe, it, expect } from 'vitest';
import {
  normalizeHomeFeed,
  normalizeSnapshot,
  normalizeEngagement,
  FALLBACK_PHOTO,
} from '../../lib/normalize';

describe('normalizeHomeFeed', () => {
  it('returns safe defaults for null feed', () => {
    const res = normalizeHomeFeed(null);
    expect(res.hero).toBeNull();
    expect(Array.isArray(res.featured)).toBe(true);
    expect(Array.isArray(res.grid)).toBe(true);
    expect(res.total).toBe(0);
    expect(res.mode).toBe('default');
  });

  it('normalizes cards and provides fallback photo', () => {
    const feed = {
      hero: { id: '1', name: 'A' },
      featured: [{ id: '2' }],
      grid: [{ id: '3', image: null }],
      total: 3,
      mode: 'verified',
    };
    const res = normalizeHomeFeed(feed);
    expect(res.hero?.id).toBe('1');
    expect(res.featured[0].id).toBe('2');
    expect(res.grid[0].image).toBe(FALLBACK_PHOTO);
    expect(res.mode).toBe('verified');
  });
});

describe('normalizeSnapshot', () => {
  it('returns defaults when missing', () => {
    const res = normalizeSnapshot(null);
    expect(Array.isArray(res.devices)).toBe(true);
    expect(res.user.id).toBe('local-user');
  });
});

describe('normalizeEngagement', () => {
  it('returns safe arrays for missing fields', () => {
    const res = normalizeEngagement(null);
    expect(Array.isArray(res.receivedLikes)).toBe(true);
    expect(Array.isArray(res.discoverFilters)).toBe(true);
  });
});
