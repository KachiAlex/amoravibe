import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from './auth';
import { getAuditEntries } from './auditStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const actor = requireAdmin(req, res);
  if (!actor) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  return res.status(200).json(getAuditEntries());
}
