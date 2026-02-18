import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser, updateUser } from '../mockStore';
import { requireAdmin } from '../../auth';
import { addAuditEntry } from '../../auditStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  // auth
  const actorId = requireAdmin(req, res);
  if (!actorId) return;

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).end('Method Not Allowed');
  }

  const user = findUser(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const updated = updateUser(id, { isVerified: true });

  addAuditEntry({ actorId, action: 'verify_user', targetId: id, message: `User ${id} verified by ${actorId}` });

  // persist to DB if available
  try {
    const { persistAudit, persistUser } = require('@/lib/persistence');
    await persistUser({ id: updated.id, email: updated.email, displayName: updated.displayName, role: updated.role, isVerified: updated.isVerified, banned: updated.banned });
    await persistAudit({ actorId, action: 'verify_user', targetId: id, message: `User ${id} verified by ${actorId}` });
  } catch (e) {
    /* ignore persistence failures in dev */
  }

  return res.status(200).json({ user: updated });
}
