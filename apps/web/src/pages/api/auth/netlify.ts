import type { NextApiRequest, NextApiResponse } from 'next';
import { decodeJwt } from 'jose';
import { findUserByEmail, createUser } from '../trust/admin/mockStore';
import { signToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const { id_token, email } = body as { id_token?: string; email?: string };

  let userEmail = email;
  if (id_token) {
    try {
      const payload = decodeJwt(id_token) as any;
      userEmail = userEmail || payload?.email;
    } catch (err) {
      // ignore decode errors
    }
  }

  if (!userEmail) return res.status(400).json({ message: 'Missing id_token or email' });

  // find or create local user
  let user = findUserByEmail(userEmail);
  if (!user) {
    user = createUser({ email: userEmail, displayName: userEmail.split('@')[0], role: userEmail === 'admin@amoravibe.com' ? 'admin' : 'user' });
  }

  // issue local JWT for API auth
  const token = await signToken({ userId: user.id, isAdmin: user.role === 'admin' });

  // set cookies (legacy session + jwt)
  res.setHeader('Set-Cookie', [
    `lovedate_session=${encodeURIComponent(JSON.stringify({ userId: user.id }))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    `lovedate_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
  ]);

  return res.status(200).json({ user, nextRoute: user.role === 'admin' ? '/admin' : '/dashboard' });
}
