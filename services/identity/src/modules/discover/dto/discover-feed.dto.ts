export type DiscoverFeedMode = 'default' | 'verified' | 'nearby' | 'fresh' | 'premium' | 'shared';

export interface DiscoverFilterOptionDto {
  label: string;
  helper: string;
  value: DiscoverFeedMode;
  premium?: boolean;
  active?: boolean;
}

export interface DiscoverCardDto {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  cityRegion?: string | null;
  distance?: string | null;
  distanceKm?: number | null;
  tags: string[];
  image: string;
  compatibility: number;
  verified: boolean;
  premiumOnly?: boolean;
  receiverId: string;
  actionable: boolean;
}

export interface DiscoverFeedResponseDto {
  hero: DiscoverCardDto | null;
  featured: DiscoverCardDto[];
  grid: DiscoverCardDto[];
  filters: DiscoverFilterOptionDto[];
  total: number;
  mode: DiscoverFeedMode;
  generatedAt: string;
}

export const DISCOVER_FILTER_PRESETS: DiscoverFilterOptionDto[] = [
  { label: 'Curated for you', helper: 'Compatibility weighted', value: 'default' },
  { label: 'Verified orbit', helper: 'Photo / ID verified', value: 'verified' },
  { label: 'Nearby now', helper: 'Within 10 miles', value: 'nearby' },
  { label: 'New this week', helper: 'Freshly onboarded', value: 'fresh' },
  { label: 'Premium spotlights', helper: 'High-intent members', value: 'premium', premium: true },
  { label: 'Shared interests', helper: 'Mutual lifestyle tags', value: 'shared' },
];
