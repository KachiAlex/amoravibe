import { createPgPrismaClient } from './utils/createPgPrismaClient';

async function main() {
  const prisma = createPgPrismaClient();
  console.log('prisma instance created');
  // Check if 'space' delegate exists
  console.log('has space:', typeof (prisma as any).space);
  try {
    // try a simple call
    const count = await (prisma as any).space.count();
    console.log('space count:', count);
  } catch (err) {
    console.error('space call error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
