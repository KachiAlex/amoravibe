import { PrismaClient } from '../generated/identity-client';
import { hashPassword } from '../src/modules/user/password.utils';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password';
  const passwordHash = hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      displayName: 'Test User',
      legalName: 'Test User Legal',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'non_binary',
      orientation: 'heterosexual',
      orientationPreferences: [],
      discoverySpace: 'both',
      matchPreferences: ['everyone'],
      city: 'Test City',
      isVerified: true,
    },
    create: {
      email,
      passwordHash,
      legalName: 'Test User Legal',
      displayName: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'non_binary',
      orientation: 'heterosexual',
      orientationPreferences: [],
      discoverySpace: 'both',
      matchPreferences: ['everyone'],
      city: 'Test City',
      isVerified: true,
    },
  });

  console.log('Upserted user:', { id: user.id, email: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
