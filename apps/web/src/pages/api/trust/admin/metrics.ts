import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from './auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAdmin(req, res);
  if (!actor) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const metrics = {
    totalUsers: 1200,
    activeUsers: 350,
    signupsThisWeek: 24,
    bannedUsers: 12,
  };

  return res.status(200).json(metrics);
}
