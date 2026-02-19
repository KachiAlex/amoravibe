import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsers } from '../trust/admin/mockStore';
import { persistUser, persistAudit } from '@/lib/persistence';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development' || process.env.TRUST_API_MOCK !== '1') return res.status(404).end('Not available');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const users = getUsers();
  const results: any[] = [];
  for (const u of users) {
    try {
      const r = await persistUser({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, isVerified: u.isVerified, banned: u.banned });
      results.push({ id: u.id, ok: !!r });
    } catch (err) {
      results.push({ id: u.id, ok: false, error: String(err) });
    }
  }

  // add an initial audit entry
  try {
    await persistAudit({ actorId: 'system', action: 'seed_db', message: 'Seeded users from mockStore' });
  } catch (err) {
    // ignore
  }

  return res.status(200).json({ seeded: results });
}
