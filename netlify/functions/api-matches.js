// Netlify Function: /api/matches (GET)
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Simulate fetching matches (stub)
  const matches = [
    { id: 'match_1', name: 'Alex', compatibility: 92 },
    { id: 'match_2', name: 'Sam', compatibility: 88 },
    { id: 'match_3', name: 'Taylor', compatibility: 85 }
  ];
  return {
    statusCode: 200,
    body: JSON.stringify(matches)
  };
};
