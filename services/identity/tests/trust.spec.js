const fetch = require('node-fetch');

describe('identity trust endpoint (preview seed)', () => {
  test('returns seeded snapshot for user_2 when ENABLE_TEST_SEEDS=1', async () => {
    // This is a unit-style test that calls the local function implementation
    const handler = require('../netlify/functions/trust-center').handler;
    const event = { queryStringParameters: { userId: 'user_2' } };
    process.env.ENABLE_TEST_SEEDS = '1';
    const res = await handler(event, {});
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.id).toBe('user_2');
  });
});
