import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsers } from '../mockStore';
import { requireAdmin } from '../auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // protect this endpoint
  const actor = await requireAdmin(req, res);
  if (!actor) return;

  if (req.method === 'GET') {
    // Prefer persisted users from DB if available
    try {
      // lazy import to avoid runtime errors when Prisma isn't configured
      const { fetchUsersFromDb } = require('@/lib/persistence');
      const persisted = await fetchUsersFromDb();
      if (persisted && Array.isArray(persisted) && persisted.length > 0) {
        return res.status(200).json({ users: persisted, total: persisted.length });
      }
    } catch (err) {
      /* ignore - fallback to mock */
    }

    const users = getUsers();
    return res.status(200).json({ users, total: users.length });
  }

  res.setHeader('Allow', 'GET');
  res.status(405).end('Method Not Allowed');
}
