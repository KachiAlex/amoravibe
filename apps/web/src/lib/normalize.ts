export const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80';

export function normalizeHomeFeed(feed: any) {
  if (!feed) {
    return {
      hero: null,
      featured: [],
      grid: [],
      filters: [],
      total: 0,
      mode: 'default',
      generatedAt: new Date().toISOString(),
    };
  }

  const hero = feed.hero ?? null;
  const featured = Array.isArray(feed.featured) ? feed.featured : [];
  const grid = Array.isArray(feed.grid) ? feed.grid : [];
  const filters = Array.isArray(feed.filters) ? feed.filters : [];

  const normalizeCard = (card: any) => ({
    id: String(card?.id ?? 'unknown'),
    name: card?.name ?? 'Someone',
    age: typeof card?.age === 'number' ? card.age : undefined,
    city: card?.city ?? null,
    cityRegion: card?.cityRegion ?? null,
    distance: card?.distance ?? null,
    distanceKm: typeof card?.distanceKm === 'number' ? card.distanceKm : null,
    tags: Array.isArray(card?.tags) ? card.tags : [],
    image: card?.image ?? FALLBACK_PHOTO,
    compatibility: typeof card?.compatibility === 'number' ? card.compatibility : undefined,
    verified: !!card?.verified,
    premiumOnly: !!card?.premiumOnly,
    receiverId: card?.receiverId ?? String(card?.id ?? ''),
    actionable: typeof card?.actionable === 'boolean' ? card.actionable : true,
    raw: card,
  });

  return {
    hero: hero ? normalizeCard(hero) : null,
    featured: featured.map(normalizeCard),
    grid: grid.map(normalizeCard),
    filters,
    total: typeof feed.total === 'number' ? feed.total : featured.length + grid.length,
    mode: feed.mode ?? 'default',
    generatedAt: feed.generatedAt ?? new Date().toISOString(),
  };
}

export function normalizeSnapshot(snapshot: any) {
  if (!snapshot) {
    return {
      devices: [],
      user: { id: 'local-user', displayName: 'You', isVerified: false, trustScore: 0, photos: [] },
    };
  }

  return {
    devices: Array.isArray(snapshot.devices) ? snapshot.devices : [],
    user: {
      id: snapshot.user?.id ?? 'local-user',
      displayName: snapshot.user?.displayName ?? 'You',
      isVerified: !!snapshot.user?.isVerified,
      trustScore: typeof snapshot.user?.trustScore === 'number' ? snapshot.user.trustScore : 0,
      photos: Array.isArray(snapshot.user?.photos) ? snapshot.user.photos : [],
      raw: snapshot.user,
    },
    raw: snapshot,
  };
}

export function normalizeEngagement(engagement: any) {
  if (!engagement) {
    return {
      receivedLikes: [],
      sentLikes: [],
      notificationPreferences: [],
      premiumPerks: [],
      safetyResources: [],
      settingsShortcuts: [],
      discoverFilters: [],
    };
  }

  return {
    receivedLikes: Array.isArray(engagement.receivedLikes) ? engagement.receivedLikes : [],
    sentLikes: Array.isArray(engagement.sentLikes) ? engagement.sentLikes : [],
    notificationPreferences: Array.isArray(engagement.notificationPreferences)
      ? engagement.notificationPreferences
      : [],
    premiumPerks: Array.isArray(engagement.premiumPerks) ? engagement.premiumPerks : [],
    safetyResources: Array.isArray(engagement.safetyResources) ? engagement.safetyResources : [],
    settingsShortcuts: Array.isArray(engagement.settingsShortcuts)
      ? engagement.settingsShortcuts
      : [],
    discoverFilters: Array.isArray(engagement.discoverFilters) ? engagement.discoverFilters : [],
    raw: engagement,
  };
}
