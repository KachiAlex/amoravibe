(async () => {
  try {
    // Use the generated Prisma client inside prisma folder
    const { PrismaClient } = require('../prisma/node_modules/.prisma/client');
    const prisma = new PrismaClient();

    const users = [
      { id: 'user_1', email: 'admin@amoravibe.com', displayName: 'Admin', role: 'admin', isVerified: true, banned: false },
      { id: 'user_2', email: 'alice@example.com', displayName: 'Alice', role: 'user', isVerified: false, banned: false },
      { id: 'user_3', email: 'bob@example.com', displayName: 'Bob', role: 'user', isVerified: true, banned: false },
      { id: 'user_4', email: 'carol@example.com', displayName: 'Carol', role: 'user', isVerified: false, banned: true },
      { id: 'user_5', email: 'dave@example.com', displayName: 'Dave', role: 'user', isVerified: true, banned: false },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { email: u.email, displayName: u.displayName, role: u.role, isVerified: u.isVerified, banned: u.banned },
        create: { id: u.id, email: u.email, displayName: u.displayName, role: u.role, isVerified: u.isVerified, banned: u.banned },
      });
    }

    await prisma.audit.create({ data: { actorId: 'system', action: 'seed_db', message: 'Seeded users for local dev' } });

    console.log('Seed complete');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
})();
