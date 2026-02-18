// Netlify Function: /api/login (POST)
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Parse credentials (stub logic)
  const { email, phone, password } = JSON.parse(event.body || '{}');
  if ((email || phone) && password === 'password123') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: { displayName: email || phone, id: 'user_123' },
        nextRoute: '/dashboard',
      })
    };
  }
  return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials.' }) };
};
