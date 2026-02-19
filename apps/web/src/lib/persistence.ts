import type { AuditEntry } from '@/pages/api/trust/admin/auditStore';

// Lightweight persistence adaptor: prefers Prisma (if available) and falls back to in-memory mock store.
export async function withPrisma<T>(fn: (prisma: any) => Promise<T>): Promise<T | null> {
  try {
    // dynamic import so project builds even when @prisma/client isn't installed locally
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let PrismaClientModule;
    try {
      PrismaClientModule = require('@prisma/client');
    } catch (e) {
      // fallback to generated client inside prisma folder (created by `prisma generate --schema=prisma/schema.prisma`)
      try {
        const path = require('path');
        const modulePath = path.join(process.cwd(), 'prisma', 'node_modules', '.prisma', 'client');
        PrismaClientModule = require(modulePath);
      } catch (e2) {
        throw e; // rethrow original error to be handled below
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
