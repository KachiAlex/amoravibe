const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync, randomUUID } = require('crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

async function main() {
  const prisma = new PrismaClient();
  const email = 'admin@amoravibe.com';
  const password = 'admin123';
  const passwordHash = hashPassword(password);

  const now = new Date();
  const id = randomUUID();

  // Insert minimal required fields; adjust columns if your schema requires more
  const result = await prisma.$executeRaw`
    INSERT INTO "User" ("id","email","passwordHash","displayName","legalName","dateOfBirth","gender","orientation","discoverySpace","city","isVerified","trustScore","visibility","createdAt","updatedAt")
    VALUES (${id}, ${email}, ${passwordHash}, 'Admin', 'Admin', ${new Date('1985-01-01')}, 'non_binary', 'heterosexual', 'both', 'Admin City', true, 100, 'trusted', ${now}, ${now})
    ON CONFLICT (email) DO UPDATE
    SET "passwordHash" = EXCLUDED."passwordHash", "displayName" = EXCLUDED."displayName", "isVerified" = EXCLUDED."isVerified", "trustScore" = EXCLUDED."trustScore", "visibility" = EXCLUDED."visibility", "updatedAt" = EXCLUDED."updatedAt";
  `;

  console.log('Inserted/updated admin user for', email, 'result:', result, 'id:', id);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
