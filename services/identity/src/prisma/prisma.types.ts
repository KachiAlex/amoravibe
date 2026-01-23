import { PrismaClient } from './client';

export type PrismaClientLike = Pick<
  PrismaClient,
  'user' | 'verification' | 'deviceFingerprint' | 'auditEvent' | 'moderationEvent' | '$extends'
>;
