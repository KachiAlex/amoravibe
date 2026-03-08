import prisma from '@/lib/db';

type AuditEntry = {
  actorId: string;
  action: string;
  targetId?: string | null;
  message?: string | null;
  details?: unknown;
  timestamp: Date;
};

// Lightweight persistence adaptor: prefers Prisma (if available) and falls back to in-memory mock store.
export async function withPrisma<T>(fn: (client: typeof prisma) => Promise<T>): Promise<T | null> {
  try {
    const result = await fn(prisma);
    return result;
  } catch (err) {
    console.warn('[persistence] Prisma unavailable, falling back to mock store', err);
    return null;
  }
}

export async function persistAudit(entry: Omit<AuditEntry, 'timestamp'>) {
  const r = await withPrisma(async (prisma) => {
    return prisma.audit.create({ data: { actorId: entry.actorId, action: entry.action, targetId: entry.targetId, message: entry.message, details: entry.details ? JSON.stringify(entry.details) : null } });
  });
  return r ?? null;
}

export async function fetchAudit(limit = 100) {
  const r = await withPrisma(async (prisma) => {
    return prisma.audit.findMany({ orderBy: { timestamp: 'desc' }, take: limit });
  });
  return r ?? null;
}

export async function persistUser(user: { id: string; email: string; displayName?: string; role?: string; isVerified?: boolean; banned?: boolean }) {
  const r = await withPrisma(async (prisma) => {
    return prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email, displayName: user.displayName, role: user.role, isVerified: user.isVerified ?? false, banned: user.banned ?? false },
      create: { id: user.id, email: user.email, displayName: user.displayName ?? user.email.split('@')[0], role: user.role ?? 'user', isVerified: user.isVerified ?? false, banned: user.banned ?? false },
    });
  });
  return r ?? null;
}

export async function fetchUsersFromDb() {
  const r = await withPrisma(async (prisma) => {
    return prisma.user.findMany({ orderBy: { email: 'asc' } });
  });
  return r ?? null;
}
