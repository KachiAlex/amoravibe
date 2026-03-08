import { createPgPrismaClient } from './utils/createPgPrismaClient';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: tsx scripts/check_user.ts <email>');
    process.exit(1);
  }
  const prisma = createPgPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user);
  }
  await prisma.$disconnect();
}

main();
