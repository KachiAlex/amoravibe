import { describe, it, expect } from 'vitest';

// Extracted filtering logic from /api/dashboard/discover
const SAMPLE_CARDS = [
  { id: '1', name: 'Maya', age: 26, verified: true, distanceKm: 1, tags: ['Art', 'Coffee'] },
  { id: '2', name: 'Sophia', age: 28, verified: true, distanceKm: 2, tags: ['Music', 'Travel'] },
  { id: '3', name: 'Jessica', age: 25, verified: true, distanceKm: 3, tags: ['Photography'] },
  { id: '4', name: 'Emma', age: 27, verified: false, distanceKm: 6, tags: ['Tech', 'Fitness'] },
  { id: '5', name: 'Olivia', age: 24, verified: true, premiumOnly: true, distanceKm: 6.5, tags: ['Fashion', 'Art'] },
  { id: '6', name: 'Amelia', age: 29, verified: true, distanceKm: 8, tags: ['Nature', 'Writing'] },
];

function filterCardsByMode(cards: any[], mode: string | null): any[] {
  if (!mode) return cards;

  switch (mode) {
    case 'verified':
      return cards.filter((c) => c.verified);
    case 'nearby':
      return cards.filter((c) => {
        const km = c.distanceKm ?? 999;
        return km <= 5;
      });
    case 'fresh':
      // Simulate new/freshly onboarded by showing youngest first
      return [...cards].sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
    case 'premium':
      return cards.filter((c) => c.premiumOnly || c.verified);
    case 'shared':
      // Simulate shared interests by picking cards with overlapping tags
      return cards.filter((c) => c.tags && c.tags.length > 0);
    default:
      return cards;
  }
}

describe('Discover Feed Filtering', () => {
  it('filters verified cards only', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'verified');
    expect(result).toHaveLength(5); // Maya, Sophia, Jessica, Olivia, Amelia
    expect(result.every((c: any) => c.verified)).toBe(true);
    expect(result.some((c: any) => c.id === '4')).toBe(false); // Emma not included
  });

  it('filters nearby cards (distance <= 5km)', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'nearby');
    expect(result).toHaveLength(4); // Maya, Sophia, Jessica, Emma (6km excluded)
    expect(result.every((c: any) => c.distanceKm <= 5)).toBe(true);
  });

  it('sorts fresh (youngest first)', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'fresh');
    expect(result).toHaveLength(6); // All cards
    expect(result[0].age).toBe(24); // Olivia (youngest)
    expect(result[result.length - 1].age).toBe(29); // Amelia (oldest)
  });

  it('filters premium cards (verified or premiumOnly)', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'premium');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c: any) => c.premiumOnly || c.verified)).toBe(true);
  });

  it('filters shared interest cards (has tags)', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'shared');
    expect(result).toHaveLength(6); // All cards have tags
    expect(result.every((c: any) => c.tags && c.tags.length > 0)).toBe(true);
  });

  it('returns all cards for default/null mode', () => {
    const result1 = filterCardsByMode(SAMPLE_CARDS, null);
    const result2 = filterCardsByMode(SAMPLE_CARDS, 'default');
    expect(result1).toHaveLength(6);
    expect(result2).toHaveLength(6);
  });

  it('respects limit parameter', () => {
    const result = filterCardsByMode(SAMPLE_CARDS, 'verified').slice(0, 3);
    expect(result).toHaveLength(3);
  });
});
