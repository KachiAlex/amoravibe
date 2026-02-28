import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from './auth';
import { getAdminMetrics } from '@/lib/admin-metrics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAdmin(req, res);
  if (!actor) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const metrics = await getAdminMetrics();
  return res.status(200).json(metrics);
}
