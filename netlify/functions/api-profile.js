// Netlify Function: /api/profile (GET, POST)
exports.handler = async function(event, context) {
  if (event.httpMethod === 'GET') {
    // Return a stubbed user profile
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: 'user_123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        gender: 'female',
        orientation: 'straight',
        discoverySpace: 'global',
        matchPreference: 'long-term',
        verificationIntent: 'email'
      })
    };
  }
  if (event.httpMethod === 'POST') {
    // Accept profile updates (stub)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Profile updated (stub)' })
    };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
};
