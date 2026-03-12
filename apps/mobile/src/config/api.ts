// Mock API client for mobile preview
const baseUrl = process.env.EXPO_PUBLIC_IDENTITY_API_URL ?? 'http://localhost:3001';

export const lovedateApi = {
  async fetchTrustPreview() {
    // Mock response - in production, replace with actual API call
    return {
      snapshotLabel: 'Amoravibe · Live',
      stats: {
        verificationPassRate: 92,
        riskHealth: 'stable' as const,
        exportSlaHours: 48,
      },
      journey: [],
      highlights: [],
    };
  },
};
