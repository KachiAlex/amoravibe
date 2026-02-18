"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLovedateApi = void 0;
function makeStub() {
    const seedProfiles = [
        {
            id: 'alice',
            displayName: 'Alice Walker',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
            photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80'],
            city: 'Brooklyn',
            cityRegion: 'Brooklyn',
            orientation: 'pansexual',
            discoverySpace: 'both',
            matchPreferences: ['everyone'],
            compatibilityScore: 92,
            isVerified: true,
            tags: ['Travel', 'Music'],
            bio: 'Design lover, coffee addict, sunrise runner.',
            distanceKm: 3,
        },
        {
            id: 'ben',
            displayName: 'Ben Hayes',
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
            photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'],
            city: 'Long Island City',
            cityRegion: 'Queens',
            orientation: 'heterosexual',
            discoverySpace: 'straight',
            matchPreferences: ['women'],
            compatibilityScore: 78,
            isVerified: false,
            tags: ['Outdoors', 'Foodie'],
            bio: 'Product manager who loves dumpling tours and bouldering.',
            distanceKm: 7,
        },
        {
            id: 'chloe',
            displayName: 'Chloe Park',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
            photos: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'],
            city: 'SoHo',
            cityRegion: 'Manhattan',
            orientation: 'queer',
            discoverySpace: 'lgbtq',
            matchPreferences: ['everyone'],
            compatibilityScore: 85,
            isVerified: true,
            tags: ['Art', 'Ceramics'],
            bio: 'Ceramicist + gallery consultant. Loves slow mornings.',
            distanceKm: 5,
        },
        {
            id: 'dani',
            displayName: 'Dani Rivera',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
            photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'],
            city: 'Williamsburg',
            cityRegion: 'Brooklyn',
            orientation: 'bisexual',
            discoverySpace: 'both',
            matchPreferences: ['everyone'],
            compatibilityScore: 74,
            isVerified: false,
            tags: ['Music', 'Reading'],
            bio: 'DJ by night, editor by day.',
            distanceKm: 4,
        },
        {
            id: 'emily',
            displayName: 'Emily Stone',
            image: 'https://images.unsplash.com/photo-1504593811423-6b3993bca7d1?auto=format&fit=crop&w=900&q=80',
            photos: ['https://images.unsplash.com/photo-1504593811423-6b3993bca7d1?auto=format&fit=crop&w=900&q=80'],
            city: 'SoHo',
            cityRegion: 'Manhattan',
            orientation: 'lesbian',
            discoverySpace: 'lgbtq',
            matchPreferences: ['women'],
            compatibilityScore: 88,
            isVerified: true,
            tags: ['Art', 'Travel'],
            bio: 'Gallery consultant. Planning a Lisbon sabbatical.',
            distanceKm: 2,
        },
    ];

    const mapToMatch = (p) => ({ id: p.id, displayName: p.displayName, avatarUrl: p.image });
    const mapToDiscoverCard = (p) => ({
        id: p.id,
        name: p.displayName,
        age: null,
        city: p.city,
        cityRegion: p.cityRegion,
        distance: `${p.distanceKm ?? 0} mi`,
        distanceKm: p.distanceKm ?? null,
        tags: p.tags || [],
        image: p.image,
        compatibility: p.compatibilityScore ?? 0,
        verified: !!p.isVerified,
        premiumOnly: false,
        receiverId: p.id,
        actionable: false,
    });

    const threads = [
        { id: 't1', name: 'Sam', avatar: seedProfiles[0].image, route: '/messages/1', lastActive: '2h', snippet: 'Hey — want to grab coffee?', vibeLine: 'Friendly', unread: true, quickReplies: ['Sure', 'Later'], status: { tone: 'violet', label: 'Active' } },
        { id: 't2', name: 'Jordan', avatar: seedProfiles[1].image, route: '/messages/2', lastActive: '1d', snippet: 'Loved your profile!', vibeLine: 'Warm', unread: false, quickReplies: ['Thanks', 'Nice'], status: { tone: 'emerald', label: 'Calm' } },
    ];

    return {
        fetchMatches: async ({ limit = 10 } = {}) => seedProfiles.slice(0, limit).map(mapToMatch),
        fetchTrustPreview: async () => ({ summary: 'Local seeded trust preview' }),
        requestAuditExport: async () => ({ status: 'ok' }),
        requestAuditPurge: async () => ({ status: 'ok' }),
        requestReverification: async () => ({ status: 'ok' }),
        fetchTrustSnapshot: async () => ({ snapshotLabel: 'Seeded snapshot' }),
        fetchEngagementDashboard: async () => ({ summary: 'engagement stub' }),
        fetchMessagingThreads: async () => threads,
        fetchDiscoverFeed: async ({ mode = 'default', limit = 12 } = {}) => ({
            hero: mapToDiscoverCard(seedProfiles[0]),
            featured: seedProfiles.slice(1, 3).map(mapToDiscoverCard),
            grid: seedProfiles.slice(3, 3 + limit - 3).map(mapToDiscoverCard),
            filters: [],
            total: seedProfiles.length,
            mode,
            generatedAt: new Date().toISOString(),
        }),
        likeUser: async () => ({ status: 'ok' }),
        nudgeLike: async () => ({ status: 'ok' }),
        toggleNotification: async () => ({ status: 'ok' }),
        trackDiscoverEvent: async () => { },
        submitOnboarding: async (payload) => ({ user: { id: `seed-${Date.now()}`, displayName: payload.displayName || 'New onboarded' } }),
    };
}

function createLovedateApi(_options) {
    return makeStub();
}
exports.createLovedateApi = createLovedateApi;
//# sourceMappingURL=index.js.map
