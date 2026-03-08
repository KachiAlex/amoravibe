import { createPgPrismaClient } from './utils/createPgPrismaClient';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: tsx scripts/get_user_full.ts <email>');
    process.exit(1);
  }
  const prisma = createPgPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User record:', user);
  }
  await prisma.$disconnect();
}

main();
