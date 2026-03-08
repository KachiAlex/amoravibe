/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv/config');
const { PrismaClient } = require('../../../prisma/node_modules/.prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required to run this script.');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/check-user.js <email>');
    process.exit(1);
  }

  const prisma = createPrisma();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found');
    } else {
      console.log({
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Check user failed', err);
  process.exit(1);
});
