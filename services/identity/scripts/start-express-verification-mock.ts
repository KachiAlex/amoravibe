import http from 'http';
import { parse as parseUrl } from 'url';

type Verification = {
  id: string;
  userId: string;
  provider: string;
  status: 'pending' | 'verified' | 'failed';
  reference?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

const store = new Map<string, Verification>();

function jsonResponse(res: http.ServerResponse, status: number, body: any) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function collectBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve(null);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = parseUrl(req.url || '', true);
  const method = req.method || 'GET';

  if (method === 'POST' && parsed.pathname === '/verifications') {
    const body = await collectBody(req);
    const id = `${Math.floor(Math.random() * 1000000)}`;
    const rec: Verification = {
      id,
      userId: (body && body.userId) || 'unknown',
      provider: (body && body.kycProvider) || 'manual',
      status: 'pending',
      reference: null,
      metadata: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.set(id, rec);
    return jsonResponse(res, 201, rec);
  }

  const matchCreate = parsed.pathname?.match(/^\/verifications\/(.+)\/complete$/);
  if (method === 'PATCH' && matchCreate) {
    const id = decodeURIComponent(matchCreate[1]);
    const existing = store.get(id);
    if (!existing) return jsonResponse(res, 404, { error: 'not found' });
    existing.status = 'verified';
    existing.updatedAt = new Date().toISOString();
    store.set(id, existing);
    return jsonResponse(res, 200, existing);
  }

  const matchGet = parsed.pathname?.match(/^\/verifications\/(.+)$/);
  if (method === 'GET' && matchGet) {
    const id = decodeURIComponent(matchGet[1]);
    const existing = store.get(id);
    if (!existing) return jsonResponse(res, 404, { error: 'not found' });
    return jsonResponse(res, 200, existing);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

const port = process.env.PORT ? Number(process.env.PORT) : 4002;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Express verification mock listening on http://localhost:${port}`);
});
