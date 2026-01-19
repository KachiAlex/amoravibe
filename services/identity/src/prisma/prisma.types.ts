import { PrismaClient } from '@prisma/client';

export type PrismaClientLike = Pick<PrismaClient, 'user' | 'verification' | 'deviceFingerprint'>;
