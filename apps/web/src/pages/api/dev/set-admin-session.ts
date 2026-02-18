import type { NextApiRequest, NextApiResponse } from 'next';

// Dev-only: set a session cookie for the admin user (user_1 in mockStore)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end('Not available');
  }

  const session = { userId: 'admin@amoravibe.com' };
  const cookieValue = encodeURIComponent(JSON.stringify(session));
  const maxAge = 60 * 60 * 24 * 30; // 30 days

  res.setHeader('Set-Cookie', `lovedate_session=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
  return res.status(200).json({ ok: true, userId: session.userId });
}
