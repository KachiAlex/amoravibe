import { randomUUID } from 'crypto';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { AuditAction } from '../../src/common/enums/audit-action.enum';
import { ModerationSeverity } from '../../src/common/enums/moderation-severity.enum';

interface UserRecord {
  id: string;
  legalName: string;
  displayName: string;
  dateOfBirth: Date;
  email?: string | null;
  phone?: string | null;
  passwordHash: string;
  gender: string;
  orientation: string;
  orientationPreferences: string[];
  discoverySpace: string;
  matchPreferences: string[];
  city: string;
  bio?: string | null;
  photos?: unknown;
  verificationIntent: string;
  trustScore: number;
  visibility: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VerificationRecord {
  id: string;
  userId: string;
  provider: string;
  status: VerificationStatus;
  reference?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceFingerprintRecord {
  id: string;
  userId?: string | null;
  hash: string;
  userAgent?: string | null;
  signals?: Record<string, unknown> | null;
  riskLabel?: string | null;
  observedAt: Date;
}

interface AuditEventRecord {
  id: string;
  userId: string;
  verificationId?: string | null;
  action: AuditAction;
  details?: Record<string, unknown> | null;
  createdAt: Date;
}

interface ModerationEventRecord {
  id: string;
  userId?: string | null;
  deviceFingerprintId?: string | null;
  severity: ModerationSeverity;
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

type DeviceFingerprintWhereInput = {
  userId?: string | { not?: string };
  hash?: string;
  userIdNot?: string;
};

export class InMemoryPrismaService {
  private users = new Map<string, UserRecord>();
  private verifications = new Map<string, VerificationRecord>();
  private deviceFingerprints = new Map<string, DeviceFingerprintRecord>();
  private auditEvents = new Map<string, AuditEventRecord>();
  private moderationEvents = new Map<string, ModerationEventRecord>();

  user = {
    create: async ({ data }: { data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const now = new Date();
      const record: UserRecord = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      this.users.set(record.id, record);
      return { ...record };
    },
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) {
        return this.cloneUser(this.users.get(where.id));
      }
      if (where.email) {
        const found = Array.from(this.users.values()).find((user) => user.email === where.email);
        return this.cloneUser(found);
      }
      return null;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<UserRecord> }) => {
      const existing = this.users.get(where.id);
      if (!existing) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      const updated: UserRecord = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      this.users.set(where.id, updated);
      return { ...updated };
    },
  };

  verification = {
    create: async ({
      data,
    }: {
      data: { userId: string; provider: string; status?: VerificationStatus };
    }) => {
      const now = new Date();
      const record: VerificationRecord = {
        id: randomUUID(),
        userId: data.userId,
        provider: data.provider,
        status: data.status ?? VerificationStatus.PENDING,
        reference: null,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };
      this.verifications.set(record.id, record);
      return { ...record };
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      const found = this.verifications.get(where.id);
      return found ? { ...found } : null;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<VerificationRecord>;
    }) => {
      const existing = this.verifications.get(where.id);
      if (!existing) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      const updated: VerificationRecord = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      this.verifications.set(where.id, updated);
      return { ...updated };
    },
  };

  deviceFingerprint = {
    count: async ({ where }: { where: { userId?: string } }) => {
      return Array.from(this.deviceFingerprints.values()).filter((fp) => fp.userId === where.userId)
        .length;
    },
    findMany: async ({
      where,
      select,
      orderBy,
      take,
    }: {
      where: DeviceFingerprintWhereInput;
      select?: { userId?: boolean };
      distinct?: string[];
      orderBy?: { observedAt?: 'asc' | 'desc' };
      take?: number;
    }) => {
      if (select?.userId) {
        const notUserId = typeof where.userId === 'object' ? where.userId.not : undefined;
        const excludedUserId = notUserId ?? where.userIdNot;
        const matches = Array.from(this.deviceFingerprints.values()).filter(
          (fp) => fp.hash === where.hash && (!excludedUserId || fp.userId !== excludedUserId)
        );
        const uniqueMap = new Map<string | null | undefined, DeviceFingerprintRecord>();
        matches.forEach((fp) => {
          if (!uniqueMap.has(fp.userId)) {
            uniqueMap.set(fp.userId ?? null, fp);
          }
        });
        return Array.from(uniqueMap.values())
          .slice(0, take ?? uniqueMap.size)
          .map((fp) => ({ userId: fp.userId }));
      }

      if (where.userId) {
        const results = Array.from(this.deviceFingerprints.values()).filter(
          (fp) => fp.userId === where.userId
        );
        if (orderBy?.observedAt === 'desc') {
          results.sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
        }
        return results.map((fp) => ({ ...fp }));
      }

      const allFingerprints = Array.from(this.deviceFingerprints.values());
      if (orderBy?.observedAt === 'desc') {
        allFingerprints.sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
      }
      return allFingerprints.map((fp) => ({ ...fp }));
    },
    create: async ({ data }: { data: Omit<DeviceFingerprintRecord, 'id' | 'observedAt'> }) => {
      const record: DeviceFingerprintRecord = {
        id: randomUUID(),
        observedAt: new Date(),
        ...data,
      };
      this.deviceFingerprints.set(record.id, record);
      return { ...record };
    },
  };

  auditEvent = {
    create: async ({
      data,
    }: {
      data: {
        userId: string;
        verificationId?: string | null;
        action: AuditAction;
        details?: Record<string, unknown> | null;
      };
    }) => {
      const record: AuditEventRecord = {
        id: randomUUID(),
        createdAt: new Date(),
        verificationId: data.verificationId ?? null,
        details: data.details ?? null,
        ...data,
      };
      this.auditEvents.set(record.id, record);
      return { ...record };
    },
    findMany: async ({ where }: { where: { verificationId?: string; userId?: string } }) => {
      return Array.from(this.auditEvents.values())
        .filter((event) => {
          if (where.verificationId && event.verificationId !== where.verificationId) {
            return false;
          }
          if (where.userId && event.userId !== where.userId) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((event) => ({ ...event }));
    },
  };

  moderationEvent = {
    create: async ({
      data,
    }: {
      data: {
        userId?: string | null;
        deviceFingerprintId?: string | null;
        severity: ModerationSeverity;
        message: string;
        metadata?: Record<string, unknown> | null;
      };
    }) => {
      const record: ModerationEventRecord = {
        id: randomUUID(),
        createdAt: new Date(),
        userId: data.userId ?? null,
        deviceFingerprintId: data.deviceFingerprintId ?? null,
        metadata: data.metadata ?? null,
        ...data,
      };
      this.moderationEvents.set(record.id, record);
      return { ...record };
    },
    findMany: async ({
      where,
      orderBy,
    }: {
      where: { deviceFingerprintId?: string; userId?: string };
      orderBy?: { createdAt: 'asc' | 'desc' };
    }) => {
      const results = Array.from(this.moderationEvents.values()).filter((event) => {
        if (where.deviceFingerprintId && event.deviceFingerprintId !== where.deviceFingerprintId) {
          return false;
        }
        if (where.userId && event.userId !== where.userId) {
          return false;
        }
        return true;
      });

      if (orderBy?.createdAt === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else {
        results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      return results.map((event) => ({ ...event }));
    },
  };

  reset() {
    this.users.clear();
    this.verifications.clear();
    this.deviceFingerprints.clear();
    this.auditEvents.clear();
    this.moderationEvents.clear();
  }

  private cloneUser(user?: UserRecord) {
    return user ? { ...user } : null;
  }
}
