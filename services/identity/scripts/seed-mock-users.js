const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync, randomUUID } = require('crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

async function main() {
  const prisma = new PrismaClient();
  const email = 'test@example.com';
  const password = 'password';
  const passwordHash = hashPassword(password);

  // Use a raw SQL INSERT with ON CONFLICT to avoid Prisma model/column mapping issues
  const now = new Date();
  const id = randomUUID();
  const result = await prisma.$executeRaw`
    INSERT INTO "User" ("id","email","passwordHash","displayName","legalName","dateOfBirth","gender","orientation","discoverySpace","city","isVerified","createdAt","updatedAt")
    VALUES (${id}, ${email}, ${passwordHash}, 'Test User', 'Test User Legal', ${new Date('1990-01-01')}, 'non_binary', 'heterosexual', 'both', 'Test City', true, ${now}, ${now})
    ON CONFLICT (email) DO UPDATE
    SET "passwordHash" = EXCLUDED."passwordHash", "displayName" = EXCLUDED."displayName", "updatedAt" = EXCLUDED."updatedAt";
  `;

  console.log('Inserted/updated user (raw SQL) for', email, 'result:', result, 'id:', id);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
