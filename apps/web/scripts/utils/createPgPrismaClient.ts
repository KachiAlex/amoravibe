import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

export function createPgPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run this script.');
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}
