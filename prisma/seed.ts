import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create the two main spaces
  const straightSpace = await prisma.space.upsert({
    where: { name: 'Straight' },
    update: {},
    create: {
      name: 'Straight',
      description: 'A space for straight individuals to connect and build community',
      icon: '❤️',
      orientation: 'straight',
      roomCreationLimit: 10,
    },
  });

  const lgbtqSpace = await prisma.space.upsert({
    where: { name: 'LGBTQ+' },
    update: {},
    create: {
      name: 'LGBTQ+',
      description: 'A welcoming space for LGBTQ+ individuals to connect and express themselves',
      icon: '🌈',
      orientation: 'lgbtq',
      roomCreationLimit: 10,
    },
  });

  console.log('✅ Spaces created:', { straightSpace, lgbtqSpace });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
