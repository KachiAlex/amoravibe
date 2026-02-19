exports.handler = async function(event, context) {
  // Expected path: /.netlify/functions/trust-center?userId=user_2 or via rewrites
  const qs = event.queryStringParameters || {};
  const userId = qs.userId || (event.path || '').split('/').pop();

  // Simulated DB lookup - in production use Prisma client
  const seeded = {
    'user_2': {
      snapshotLabel: 'seeded-e2e-snapshot',
      user: { id: 'user_2', email: 'user_2@example.com', displayName: 'E2E Test User', isVerified: true },
      devices: [],
      engagements: { sentLikes: [], receivedLikes: [], recentMatches: [] },
      matches: []
    }
  };

  // Allow test-seed only in preview/CI via env var
  if (process.env.ENABLE_TEST_SEEDS === '1' && seeded[userId]) {
    return { statusCode: 200, body: JSON.stringify(seeded[userId]) };
  }

  // Default: Not Found (production should query real DB)
  return { statusCode: 404, body: 'Not Found' };
};
