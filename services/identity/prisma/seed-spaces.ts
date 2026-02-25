import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.space.deleteMany(); // Remove all existing spaces
  await prisma.space.createMany({
    data: [
      {
        id: 'straight',
        name: 'Straight Space',
        type: 'straight',
        description: 'A space for straight individuals to connect and meet.',
        icon: '❤️',
        color: 'from-pink-400 to-fuchsia-600',
      },
      {
        id: 'lgbtq',
        name: 'LGBTQ+ Space',
        type: 'lgbtq',
        description: 'An inclusive space for all LGBTQ+ identities.',
        icon: '🌈',
        color: 'from-yellow-400 to-pink-600',
      },
    ],
  });
  console.log('Seeded spaces: Straight and LGBTQ+');
}

main().finally(() => prisma.$disconnect());
