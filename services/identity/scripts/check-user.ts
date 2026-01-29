import { PrismaClient } from '../src/prisma/client';
import { verifyPassword } from '../src/modules/user/password.utils';

const prisma = new PrismaClient();

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: ts-node scripts/check-user.ts <email> <password>');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  if (!user) {
    console.error(`No user found for email ${email}`);
    return;
  }

  const passwordValid = verifyPassword(password, user.passwordHash);
  console.log({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    passwordValid,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
