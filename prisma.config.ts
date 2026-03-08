import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const schema = process.env.PRISMA_SCHEMA_PATH ?? 'prisma/schema.prisma';
const migrationsPath = process.env.PRISMA_MIGRATIONS_PATH ?? 'prisma/migrations';
const datasourceUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema,
  migrations: {
    path: migrationsPath,
    seed: 'tsx prisma/seed.ts',
  },
  datasource: datasourceUrl ? { url: datasourceUrl } : undefined,
});
