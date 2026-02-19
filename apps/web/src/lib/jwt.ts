import crypto from 'crypto';

const SECRET = process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me';

function base64UrlEncode(input: string | object) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return Buffer.from(str)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function toSecondsFromNow(ttl: string | number) {
  const now = Math.floor(Date.now() / 1000);
  if (typeof ttl === 'number') return now + ttl;
  const m = String(ttl).match(/^(\d+)(s|m|h|d)$/);
  if (!m) return now + 30 * 24 * 3600; // default 30d
  const v = Number(m[1]);
  const unit = m[2];
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return now + v * mult;
}

export async function signToken(payload: Record<string, unknown>, expiresIn: string | number = '30d') {
  const iat = Math.floor(Date.now() / 1000);
  const exp = toSecondsFromNow(expiresIn);
  const body = { ...payload, iat, exp };
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(header);
  const encodedBody = base64UrlEncode(body);
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, sig] = parts;
    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(`${h}.${p}`)
      .digest('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (sig !== expected) return null;
    const payload = JSON.parse(base64UrlDecode(p));
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as Record<string, unknown>;
  } catch (err) {
    return null;
  }
}
