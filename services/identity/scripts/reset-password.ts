import { PrismaClient } from '../src/prisma/client';
import { hashPassword } from '../src/modules/user/password.utils';

const prisma = new PrismaClient();

async function main() {
  const email = 'onyedika.akoma@gmail.com';
  const newPassword = 'dikaoliver2660';

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hashPassword(newPassword) },
  });

  console.log(`Password updated for ${email}`);
}

main().finally(() => prisma.$disconnect());
