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
  async fetchOnboardingStatus(userId: string) {
    // Mock response - in production, replace with actual API call
    return {
      userId,
      progressPercent: 40,
      steps: [
        {
          id: 'identity',
          title: 'Identity proof',
          description: 'Scan government ID + liveness selfie',
          status: 'active' as const,
        },
        {
          id: 'device',
          title: 'Device trust',
          description: 'Register trusted device + biometric fallback',
          status: 'pending' as const,
        },
        {
          id: 'profile',
          title: 'Discovery profile',
          description: 'Orientation, pronouns, and match intent',
          status: 'pending' as const,
        },
      ],
    };
  },
};
