import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
const prisma = new PrismaClient();

async function main() {
  const spaces = [
    { name: 'Straight', description: 'A space for straight users.' },
    { name: 'LGBTQ+', description: 'A space for LGBTQ+ users.' },
  ];

  for (const s of spaces) {
    try {
      // Prefer using Prisma delegate now that the client supports `space`.
      const id = uuidv4();
      await prisma.space.upsert({
        where: { name: s.name },
        update: { description: s.description },
        create: { id, name: s.name, description: s.description },
      });
      console.log(`Upserted space (delegate): ${s.name}`);
    } catch (err) {
      console.error('Failed to upsert space', s.name, err);
    }
  }

  // Verify
  try {
    const rows: any = await prisma.$queryRawUnsafe('SELECT name, description FROM "Space" ORDER BY name');
    console.log('Spaces in DB:', rows);
  } catch (err) {
    console.error('Failed to query spaces', err);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
