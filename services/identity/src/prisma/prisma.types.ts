import { PrismaService } from './prisma.service';

export type PrismaClientLike = Pick<
  PrismaService,
  | 'user'
  | 'verification'
  | 'deviceFingerprint'
  | 'auditEvent'
  | 'auditExportRequest'
  | 'auditPurgeRequest'
  | 'moderationEvent'
  | 'riskSignal'
  | 'analyticsUserSnapshot'
  | 'analyticsTrustSignalFact'
  | 'analyticsModerationFact'
  | 'analyticsIngestionRun'
  | '$extends'
>;
