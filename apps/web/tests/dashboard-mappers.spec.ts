import { describe, it, expect } from 'vitest';
import {
  mapCardToDiscoverPerson,
  normalizeDiscoverFeed,
  createDiscoverFeedFromCards,
  FALLBACK_PROFILE_PHOTO,
} from '../src/lib/dashboard-mappers';

import type { DiscoverCard, DiscoverFeedResponse } from '@/lib/api-types';

describe('dashboard mappers', () => {
  it('mapCardToDiscoverPerson uses fallbacks for missing fields', () => {
    const card = {
      id: 'x',
      name: 'X',
      // intentionally missing optional fields
    } as unknown as DiscoverCard;

    const mapped = mapCardToDiscoverPerson(card, 'default');

    expect(mapped.id).toBe('x');
    expect(mapped.name).toBe('X');
    expect(mapped.image).toBeTruthy();
    expect(mapped.image).toBe(FALLBACK_PROFILE_PHOTO);
    expect(mapped.age).toBeNull();
    expect(mapped.city).toBeNull();
    expect(mapped.tags).toEqual([]);
  });

  it('normalizeDiscoverFeed falls back to provided fallback feed', () => {
    const fallback: DiscoverFeedResponse = createDiscoverFeedFromCards([], 'default');
    const result = normalizeDiscoverFeed(null, fallback);

    expect(result).toEqual(fallback);
  });
});
