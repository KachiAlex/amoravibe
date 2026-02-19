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

  // Prefer DB-backed audit entries when available
  try {
    const { fetchAudit } = require('@/lib/persistence');
    const persisted = await fetchAudit(200);
    if (persisted && Array.isArray(persisted)) return res.status(200).json(persisted);
  } catch (e) {
    /* ignore */
  }

  return res.status(200).json(getAuditEntries());
}
