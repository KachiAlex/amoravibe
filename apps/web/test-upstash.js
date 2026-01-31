// test-upstash.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function testConnection() {
  try {
    await redis.set('test', 'Hello, Upstash!');
    const value = await redis.get('test');
    console.log('Success! Value from Upstash Redis:', value);
  } catch (error) {
    console.error('Error connecting to Upstash Redis:', error.message);
  }
}

testConnection();
