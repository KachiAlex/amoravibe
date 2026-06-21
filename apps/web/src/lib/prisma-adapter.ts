import { PrismaNeon } from '@prisma/adapter-neon';

let cachedNeonAdapter: PrismaNeon | null = null;

export function getPgAdapter() {
  if (cachedNeonAdapter) {
    return cachedNeonAdapter;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create the Prisma adapter.');
  }

  cachedNeonAdapter = new PrismaNeon({ connectionString });
  return cachedNeonAdapter;
}

export type PgAdapter = PrismaNeon;
