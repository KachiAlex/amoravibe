import type {
  DiscoverCard,
  DiscoverFeedMode,
  DiscoverFeedResponse,
  DiscoverFilterOption,
} from '@/lib/api-types';

export const FALLBACK_PROFILE_PHOTO =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80';

const DEFAULT_DISCOVER_FILTERS: DiscoverFilterOption[] = [
  { label: 'Curated for you', helper: 'Compatibility weighted', value: 'default' },
  { label: 'Verified orbit', helper: 'Photo / ID verified', value: 'verified' },
  { label: 'Nearby now', helper: 'Within 10 miles', value: 'nearby' },
  { label: 'New this week', helper: 'Freshly onboarded', value: 'fresh' },
  { label: 'Premium spotlights', helper: 'High-intent members', value: 'premium', premium: true },
  { label: 'Shared interests', helper: 'Mutual lifestyle tags', value: 'shared' },
];

export const applyActiveStateToFilters = (
  filters: DiscoverFilterOption[],
  mode: DiscoverFeedMode
): DiscoverFilterOption[] =>
  filters.map((filter) => {
    const value = filter.value ?? (filter.label || 'default').toLowerCase();
    return {
      ...filter,
      value,
      active: value === mode,
    };
  });

export const createDiscoverFeedFromCards = (
  cards: DiscoverCard[],
  mode: DiscoverFeedMode,
  filters: DiscoverFilterOption[] = DEFAULT_DISCOVER_FILTERS
): DiscoverFeedResponse => ({
  hero: cards[0] ?? null,
  featured: cards.slice(1, 3),
  grid: cards.slice(3, 12),
  filters: applyActiveStateToFilters(filters, mode),
  total: cards.length,
  mode,
  generatedAt: new Date().toISOString(),
});

export const normalizeDiscoverFeed = (
  feed: DiscoverFeedResponse | null,
  fallback: DiscoverFeedResponse
): DiscoverFeedResponse => {
  if (!feed) return fallback;

  return {
    ...feed,
    hero: feed.hero ?? fallback.hero,
    featured: feed.featured?.length ? feed.featured : fallback.featured,
    grid: feed.grid?.length ? feed.grid : fallback.grid,
    filters: applyActiveStateToFilters(
      feed.filters?.length ? feed.filters : fallback.filters,
      feed.mode ?? fallback.mode
    ),
    total: typeof feed.total === 'number' ? feed.total : fallback.total,
  };
};

export const mapCardToDiscoverPerson = (card: DiscoverCard, mode: DiscoverFeedMode) => ({
  id: card.id,
  name: card.name,
  age: card.age ?? null,
  city: card.city ?? null,
  cityRegion: card.cityRegion ?? null,
  distance: card.distance ?? null,
  tags: card.tags ?? [],
  image: card.image || FALLBACK_PROFILE_PHOTO,
  compatibility: card.compatibility,
  verified: card.verified ?? false,
  premiumOnly: card.premiumOnly,
  receiverId: card.receiverId,
  actionable: card.actionable,
  mode,
});
