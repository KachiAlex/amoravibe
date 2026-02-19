import type { NextApiRequest, NextApiResponse } from 'next';

// Dev-only: clear the lovedate_session cookie
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development' || process.env.TRUST_API_MOCK !== '1') {
    return res.status(404).end('Not available');
  }

  res.setHeader('Set-Cookie', `lovedate_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res.status(200).json({ ok: true });
}
