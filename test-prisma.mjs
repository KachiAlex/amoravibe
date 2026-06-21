import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const count = await prisma.user.count();
  console.log('User count:', count);
} catch (e) {
  console.error('Error:', e);
  console.error('Error message:', e.message);
  console.error('Error type:', e.constructor.name);
} finally {
  await prisma.$disconnect();
}
