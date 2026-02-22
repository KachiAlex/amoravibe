import type { AuditEntry } from '@/pages/api/trust/admin/auditStore';

// Lightweight persistence adaptor: prefers Prisma (if available) and falls back to in-memory mock store.
export async function withPrisma<T>(fn: (prisma: any) => Promise<T>): Promise<T | null> {
  try {
    // dynamic import so project builds even when @prisma/client isn't installed locally
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let PrismaClientModule;
    try {
      // prefer the installed package
      PrismaClientModule = require('@prisma/client');
    } catch (e) {
      // webpack emits a warning when `require()` receives a non-literal expression.
      // To avoid that, try a small set of literal candidate paths that might
      // contain the generated Prisma client. This keeps the requires static
      // so bundlers won't warn about dynamic expressions.
      const candidates = [
        'prisma/node_modules/.prisma/client',
        './prisma/node_modules/.prisma/client',
      ];
      let found = false;
      for (const cand of candidates) {
        try {
          // these are literal strings to satisfy bundlers
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          PrismaClientModule = require(cand);
          found = true;
          break;
        } catch (err) {
          // try next
        }
      }
      if (!found) {
        // rethrow original error so outer catch returns null
        throw e;
      }
    }

    const { PrismaClient } = PrismaClientModule;
    const prisma = new PrismaClient();
    try {
      const r = await fn(prisma);
      await prisma.$disconnect();
      return r;
    } catch (err) {
      await prisma.$disconnect();
      throw err;
    }
  } catch (err) {
    // Prisma not available or error - indicate by returning null
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
