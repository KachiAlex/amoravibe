import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomName(i: number) {
  const names = ['Aisha','Ben','Chloe','Damilola','Ethan','Femi','Grace','Hana','Ike','Joy','Kemi','Lina','Moses','Nia','Obi','Pia','Quincy','Rita','Sade','Theo'];
  return names[i % names.length] + (i > names.length ? `-${i}` : '');
}

async function seed() {
  try {
    await prisma.$connect();
    console.log('Connected to DB — seeding users');

    const password = 'Password123!';
    const hashed = await bcrypt.hash(password, 10);

    const users = [] as any[];
    for (let i = 1; i <= 20; i++) {
      const name = randomName(i - 1);
      const email = `seeduser${i}@local.test`;
      users.push({
        name,
        email,
        hashedPassword: hashed,
        about: `Seed user ${i} for testing matching flows.`,
        interests: ['music','movies','travel']
      });
    }

    for (const u of users) {
      // upsert so script is re-runnable
      await prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, hashedPassword: u.hashedPassword, bio: u.bio },
        create: u,
      });
      console.log('Upserted', u.email);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
