import { randomUUID } from 'crypto';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { AuditAction } from '../../src/common/enums/audit-action.enum';
import { ModerationSeverity } from '../../src/common/enums/moderation-severity.enum';
import {
  AuditActorType,
  AuditEntityType,
  AuditExportStatus,
  AuditPurgeStatus,
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
  AnalyticsPiiTier,
} from '../../src/prisma/client';

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
  actorType: AuditActorType;
  actorId?: string | null;
  entityType?: AuditEntityType | null;
  entityId?: string | null;
  channel?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  createdAt: Date;
}

interface AuditExportRequestRecord {
  id: string;
  userId: string;
  status: AuditExportStatus;
  storageLocation?: string | null;
  failureReason?: string | null;
  payload?: Record<string, unknown> | null;
  requestedAt: Date;
  processedAt?: Date | null;
}

interface AuditPurgeRequestRecord {
  id: string;
  userId: string;
  status: AuditPurgeStatus;
  reason?: string | null;
  requestedAt: Date;
  processedAt?: Date | null;
}

interface RiskSignalRecord {
  id: string;
  userId?: string | null;
  relatedUserId?: string | null;
  deviceFingerprintId?: string | null;
  type: RiskSignalType;
  channel: RiskSignalChannel;
  severity: RiskSignalSeverity;
  metadata?: Record<string, unknown> | null;
  features?: Record<string, unknown> | null;
  score?: number | null;
  createdAt: Date;
}

interface AnalyticsUserSnapshotRecord {
  id: string;
  userId: string;
  snapshotDate: Date;
  hashedEmail?: string | null;
  hashedPhone?: string | null;
  orientation: string;
  discoverySpace: string;
  trustScore: number;
  isVerified: boolean;
  piiTier: AnalyticsPiiTier;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

interface AnalyticsTrustSignalFactRecord {
  id: string;
  signalId: string;
  userId?: string | null;
  hashedUserId?: string | null;
  signalType: RiskSignalType;
  channel: RiskSignalChannel;
  severity: RiskSignalSeverity;
  score?: number | null;
  piiTier: AnalyticsPiiTier;
  occurredAt: Date;
  createdAt: Date;
}

interface AnalyticsModerationFactRecord {
  id: string;
  moderationEventId: string;
  userId?: string | null;
  hashedUserId?: string | null;
  severity: ModerationSeverity;
  message: string;
  piiTier: AnalyticsPiiTier;
  occurredAt: Date;
  createdAt: Date;
}

interface AnalyticsIngestionRunRecord {
  id: string;
  jobName: string;
  lastRunAt?: Date | null;
  checkpoint?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
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
  private auditExportRequests = new Map<string, AuditExportRequestRecord>();
  private auditPurgeRequests = new Map<string, AuditPurgeRequestRecord>();
  private riskSignals = new Map<string, RiskSignalRecord>();
  private analyticsUserSnapshots = new Map<string, AnalyticsUserSnapshotRecord>();
  private analyticsTrustSignals = new Map<string, AnalyticsTrustSignalFactRecord>();
  private analyticsModerationFacts = new Map<string, AnalyticsModerationFactRecord>();
  private analyticsRuns = new Map<string, AnalyticsIngestionRunRecord>();

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
    findMany: async ({ where }: { where?: { updatedAt?: { gte?: Date } } } = {}) => {
      let results = Array.from(this.users.values());
      if (where?.updatedAt?.gte) {
        results = results.filter((user) => user.updatedAt >= where.updatedAt!.gte!);
      }
      return results.map((user) => ({ ...user }));
    },
  };

  riskSignal = {
    create: async ({ data }: { data: Omit<RiskSignalRecord, 'id' | 'createdAt'> }) => {
      const record: RiskSignalRecord = {
        id: randomUUID(),
        createdAt: new Date(),
        ...data,
      };
      this.riskSignals.set(record.id, record);
      return { ...record };
    },
    findMany: async (args?: {
      where?: { createdAt?: { gt?: Date } };
      orderBy?: { createdAt: 'asc' | 'desc' };
    }) => {
      let results = Array.from(this.riskSignals.values());
      if (args?.where?.createdAt?.gt) {
        results = results.filter((signal) => signal.createdAt > args.where!.createdAt!.gt!);
      }
      const order = args?.orderBy?.createdAt;
      if (order === 'asc') {
        results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      } else if (order === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return results.map((signal) => ({ ...signal }));
    },
  };

  analyticsUserSnapshot = {
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { userId_snapshotDate: { userId: string; snapshotDate: Date } };
      update: Partial<AnalyticsUserSnapshotRecord>;
      create: Omit<AnalyticsUserSnapshotRecord, 'id'> & { id?: string };
    }) => {
      const key = this.snapshotKey(
        where.userId_snapshotDate.userId,
        where.userId_snapshotDate.snapshotDate
      );
      const existing = this.analyticsUserSnapshots.get(key);
      if (existing) {
        const next = { ...existing, ...update };
        this.analyticsUserSnapshots.set(key, next as AnalyticsUserSnapshotRecord);
        return { ...next };
      }
      const record = {
        id: create.id ?? randomUUID(),
        ...create,
      } as AnalyticsUserSnapshotRecord;
      this.analyticsUserSnapshots.set(key, record);
      return { ...record };
    },
    findMany: async () =>
      Array.from(this.analyticsUserSnapshots.values()).map((entry) => ({ ...entry })),
  };

  analyticsTrustSignalFact = {
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { signalId: string };
      update: Partial<AnalyticsTrustSignalFactRecord>;
      create: Omit<AnalyticsTrustSignalFactRecord, 'id'> & { id?: string };
    }) => {
      const id = where.signalId;
      const existing = this.analyticsTrustSignals.get(id);
      if (existing) {
        const next = { ...existing, ...update };
        this.analyticsTrustSignals.set(id, next as AnalyticsTrustSignalFactRecord);
        return { ...next };
      }
      const record: AnalyticsTrustSignalFactRecord = {
        id: create.id ?? randomUUID(),
        ...create,
      };
      this.analyticsTrustSignals.set(id, record);
      return { ...record };
    },
    findMany: async () =>
      Array.from(this.analyticsTrustSignals.values()).map((entry) => ({ ...entry })),
  };

  analyticsModerationFact = {
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { moderationEventId: string };
      update: Partial<AnalyticsModerationFactRecord>;
      create: Omit<AnalyticsModerationFactRecord, 'id'> & { id?: string };
    }) => {
      const id = where.moderationEventId;
      const existing = this.analyticsModerationFacts.get(id);
      if (existing) {
        const next = { ...existing, ...update };
        this.analyticsModerationFacts.set(id, next as AnalyticsModerationFactRecord);
        return { ...next };
      }
      const record: AnalyticsModerationFactRecord = {
        id: create.id ?? randomUUID(),
        ...create,
      };
      this.analyticsModerationFacts.set(id, record);
      return { ...record };
    },
    findMany: async () =>
      Array.from(this.analyticsModerationFacts.values()).map((entry) => ({ ...entry })),
  };

  analyticsIngestionRun = {
    findUnique: async ({ where }: { where: { jobName: string } }) => {
      const run = this.analyticsRuns.get(where.jobName);
      return run ? { ...run } : null;
    },
    upsert: async ({
      where,
      update,
      create,
    }: {
      where: { jobName: string };
      update: Partial<AnalyticsIngestionRunRecord>;
      create: Omit<AnalyticsIngestionRunRecord, 'id' | 'createdAt' | 'updatedAt'> & {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
      };
    }) => {
      const existing = this.analyticsRuns.get(where.jobName);
      if (existing) {
        const next: AnalyticsIngestionRunRecord = {
          ...existing,
          ...update,
          updatedAt: new Date(),
        };
        this.analyticsRuns.set(where.jobName, next);
        return { ...next };
      }
      const record: AnalyticsIngestionRunRecord = {
        id: create.id ?? randomUUID(),
        createdAt: create.createdAt ?? new Date(),
        updatedAt: create.updatedAt ?? new Date(),
        ...create,
      };
      this.analyticsRuns.set(where.jobName, record);
      return { ...record };
    },
    findMany: async () => Array.from(this.analyticsRuns.values()).map((entry) => ({ ...entry })),
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
        actorId: data.actorId ?? null,
        entityId: data.entityId ?? null,
        channel: data.channel ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        expiresAt: data.expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
    deleteMany: async ({ where }: { where: { userId?: string; expiresAt?: { lt?: Date } } }) => {
      let count = 0;
      for (const [id, event] of this.auditEvents.entries()) {
        const matchesUser = where.userId ? event.userId === where.userId : true;
        const matchesExpiry = where.expiresAt?.lt ? event.expiresAt < where.expiresAt.lt : true;
        if (matchesUser && matchesExpiry) {
          this.auditEvents.delete(id);
          count += 1;
        }
      }
      return { count };
    },
  };

  auditExportRequest = {
    create: async ({
      data,
    }: {
      data: {
        userId: string;
        status: AuditExportStatus;
        storageLocation?: string | null;
        failureReason?: string | null;
        payload?: Record<string, unknown> | null;
      };
    }) => {
      const record: AuditExportRequestRecord = {
        id: randomUUID(),
        requestedAt: new Date(),
        processedAt: null,
        ...data,
      };
      this.auditExportRequests.set(record.id, record);
      return { ...record };
    },
    findMany: async ({
      where,
      orderBy,
      take,
    }: {
      where: { status?: AuditExportStatus };
      orderBy?: { requestedAt: 'asc' | 'desc' };
      take?: number;
    }) => {
      let results = Array.from(this.auditExportRequests.values());
      if (where.status) {
        results = results.filter((request) => request.status === where.status);
      }
      if (orderBy?.requestedAt === 'asc') {
        results.sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
      } else if (orderBy?.requestedAt === 'desc') {
        results.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
      }
      if (take) {
        results = results.slice(0, take);
      }
      return results.map((record) => ({ ...record }));
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<AuditExportRequestRecord>;
    }) => {
      const existing = this.auditExportRequests.get(where.id);
      if (!existing) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      const updated: AuditExportRequestRecord = {
        ...existing,
        ...data,
      };
      this.auditExportRequests.set(where.id, updated);
      return { ...updated };
    },
  };

  auditPurgeRequest = {
    create: async ({
      data,
    }: {
      data: { userId: string; status: AuditPurgeStatus; reason?: string | null };
    }) => {
      const record: AuditPurgeRequestRecord = {
        id: randomUUID(),
        requestedAt: new Date(),
        processedAt: null,
        ...data,
      };
      this.auditPurgeRequests.set(record.id, record);
      return { ...record };
    },
    findMany: async ({
      where,
      orderBy,
      take,
    }: {
      where: { status?: AuditPurgeStatus };
      orderBy?: { requestedAt: 'asc' | 'desc' };
      take?: number;
    }) => {
      let results = Array.from(this.auditPurgeRequests.values());
      if (where.status) {
        results = results.filter((request) => request.status === where.status);
      }
      if (orderBy?.requestedAt === 'asc') {
        results.sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
      } else if (orderBy?.requestedAt === 'desc') {
        results.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
      }
      if (take) {
        results = results.slice(0, take);
      }
      return results.map((record) => ({ ...record }));
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<AuditPurgeRequestRecord>;
    }) => {
      const existing = this.auditPurgeRequests.get(where.id);
      if (!existing) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      const updated: AuditPurgeRequestRecord = {
        ...existing,
        ...data,
      };
      this.auditPurgeRequests.set(where.id, updated);
      return { ...updated };
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
      where?: { deviceFingerprintId?: string; userId?: string; createdAt?: { gt?: Date } };
      orderBy?: { createdAt: 'asc' | 'desc' };
    } = {}) => {
      const results = Array.from(this.moderationEvents.values()).filter((event) => {
        if (where?.deviceFingerprintId && event.deviceFingerprintId !== where.deviceFingerprintId) {
          return false;
        }
        if (where?.userId && event.userId !== where.userId) {
          return false;
        }
        if (where?.createdAt?.gt && !(event.createdAt > where.createdAt.gt)) {
          return false;
        }
        return true;
      });

      if (orderBy?.createdAt === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (orderBy?.createdAt === 'asc') {
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
    this.auditExportRequests.clear();
    this.auditPurgeRequests.clear();
    this.riskSignals.clear();
    this.analyticsUserSnapshots.clear();
    this.analyticsTrustSignals.clear();
    this.analyticsModerationFacts.clear();
    this.analyticsRuns.clear();
  }

  private cloneUser(user?: UserRecord) {
    return user ? { ...user } : null;
  }

  private snapshotKey(userId: string, snapshotDate: Date) {
    return `${userId}:${snapshotDate.toISOString()}`;
  }
}
