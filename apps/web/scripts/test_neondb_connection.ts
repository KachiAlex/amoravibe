import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection to NeonDB successful:', result);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
