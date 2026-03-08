import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createPgPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run this script.');
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
