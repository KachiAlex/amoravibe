import { PrismaPg } from '@prisma/adapter-pg';

let cachedPgAdapter: PrismaPg | null = null;

export function getPgAdapter() {
  if (cachedPgAdapter) {
    return cachedPgAdapter;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create the Prisma Pg adapter.');
  }

  cachedPgAdapter = new PrismaPg({ connectionString });
  return cachedPgAdapter;
}

export type PgAdapter = PrismaPg;
