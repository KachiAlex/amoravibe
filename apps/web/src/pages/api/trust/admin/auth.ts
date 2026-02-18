import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser, findUserByEmail } from './mockStore';
import { verifyToken } from '@/lib/jwt';

/**
 * Require that the incoming API request is authenticated as an admin.
 * Returns the session userId when authorized, otherwise sends an HTTP error response and returns null.
 */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
  // 1) Check Authorization header (Bearer)
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    if (!payload || typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'Invalid token' });
      return null;
    }
    let user = findUser(payload.userId) || findUserByEmail(payload.userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return null;
    }
    return user.id as string;
  }

  // 2) Check signed token cookie
  const signed = req.cookies?.lovedate_token as string | undefined;
  if (signed) {
    const payload = await verifyToken(signed);
    if (!payload || typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'Invalid token cookie' });
      return null;
    }
    let user = findUser(payload.userId) || findUserByEmail(payload.userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return null;
    }
    return user.id as string;
  }

  // 3) Fallback to legacy session cookie
  const raw = req.cookies?.lovedate_session as string | undefined;
  if (!raw) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }

  let session: { userId?: string } | null = null;
  try {
    session = JSON.parse(raw || '{}');
  } catch (err) {
    res.status(400).json({ message: 'Invalid session cookie' });
    return null;
  }

  const userId = session?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }

  let user = findUser(userId) || findUserByEmail(userId);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return null;
  }

  return user.id;
}
