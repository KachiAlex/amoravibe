import type { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_UPSTREAM = 'http://localhost:4001/api/v1';
const upstreamBase = (process.env.TRUST_API_PROXY_TARGET || DEFAULT_UPSTREAM).replace(/\/$/, '');
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const MAX_BODY_BYTES = 6 * 1024 * 1024; // 6 MB inline payload cap
const STATIC_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://amoravibe-web.vercel.app',
  'https://amoravibe.vercel.app',
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_FALLBACK_SITE_URL,
]
  .filter(Boolean)
  .map((origin) => origin!) as string[];

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
};

const HOP_BY_HOP_HEADERS = new Set(['connection', 'content-length', 'content-encoding']);

function resolveAllowedOrigin(req: NextApiRequest) {
  const origin = req.headers.origin;
  if (!origin) return null;
  if (STATIC_ALLOWED_ORIGINS.length === 0) {
    return origin;
  }
  return STATIC_ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function applyCors(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigin = resolveAllowedOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  const requestHeaders = req.headers['access-control-request-headers'];
  res.setHeader(
    'Access-Control-Allow-Headers',
    requestHeaders || 'Content-Type, Authorization, X-Requested-With, Accept'
  );
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
}

function normalizeHeaders(headers: NextApiRequest['headers']) {
  const result: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }
    result[key] = Array.isArray(value) ? value.join(',') : value;
  });
  return result;
}

async function readRequestBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!ALLOWED_METHODS.includes(req.method ?? '')) {
    res.setHeader('Allow', ALLOWED_METHODS);
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const searchIndex = req.url?.indexOf('?') ?? -1;
  const search = searchIndex >= 0 ? (req.url?.slice(searchIndex) ?? '') : '';
  const pathSegments = req.query.path;
  const path =
    Array.isArray(pathSegments) && pathSegments.length ? `/${pathSegments.join('/')}` : '';
  const targetUrl = `${upstreamBase}${path}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: normalizeHeaders(req.headers),
  };

  if (!['GET', 'HEAD'].includes(req.method ?? 'GET')) {
    try {
      const rawBody = await readRequestBody(req);
      const arrayBuffer = new ArrayBuffer(rawBody.byteLength);
      new Uint8Array(arrayBuffer).set(rawBody);
      init.body = arrayBuffer;
    } catch (error) {
      console.error('Failed to read onboarding payload', error);
      const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
      res
        .status(statusCode)
        .json({
          message:
            statusCode === 413
              ? 'Request payload exceeded inline upload limit'
              : 'Unable to read request body',
        });
      return;
    }
  }

  try {
    const response = await fetch(targetUrl, init);
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);
    if (!response.body) {
      res.end();
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error('Trust API proxy error', error);
    res.status(502).json({ message: 'Unable to reach Trust API gateway' });
  }
}
