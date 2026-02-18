import type { NextApiRequest, NextApiResponse } from 'next';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsers } from '../mockStore';
import { requireAdmin } from '../auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // protect this endpoint
  const actor = requireAdmin(req, res);
  if (!actor) return;

  if (req.method === 'GET') {
    const users = getUsers();
    return res.status(200).json({ users, total: users.length });
  }

  res.setHeader('Allow', 'GET');
  res.status(405).end('Method Not Allowed');
}
