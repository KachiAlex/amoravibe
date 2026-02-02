import http from 'http';

function request(method: string, path: string, body?: any, port = 4002): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: data
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          }
        : undefined,
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          resolve({ status: res.statusCode ?? 0, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode ?? 0, body: raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Creating verification (express mock)...');
  const create = await request('POST', '/verifications', { userId: 'u-express-1', kycProvider: 'mock' });
  console.log('Create status:', create.status, 'body:', create.body);
  const id = create.body?.id;
  if (!id) throw new Error('No id returned from create');

  console.log('Completing verification', id);
  const complete = await request('PATCH', `/verifications/${encodeURIComponent(id)}/complete`);
  console.log('Complete status:', complete.status, 'body:', complete.body);

  console.log('Fetching verification', id);
  const fetched = await request('GET', `/verifications/${encodeURIComponent(id)}`);
  console.log('Fetched status:', fetched.status, 'body:', fetched.body);
}

run().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
