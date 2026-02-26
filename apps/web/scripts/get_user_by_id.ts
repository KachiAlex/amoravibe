import { PrismaClient } from '@prisma/client';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: tsx scripts/get_user_by_id.ts <userId>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User record:', user);
  }
  await prisma.$disconnect();
}

main();
