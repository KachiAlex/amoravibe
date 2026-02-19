(async () => {
  try {
    const { PrismaClient } = require('../prisma/node_modules/.prisma/client');
    const prisma = new PrismaClient();

    const users = [
      { id: 'admin@amoravibe.com', email: 'admin@amoravibe.com', displayName: 'Admin', role: 'admin', isVerified: true, banned: false },
      { id: 'user_2', email: 'user_2@example.com', displayName: 'E2E Test User', role: 'user', isVerified: true, banned: false }
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { email: u.email, displayName: u.displayName, role: u.role, isVerified: u.isVerified, banned: u.banned },
        create: { id: u.id, email: u.email, displayName: u.displayName, role: u.role, isVerified: u.isVerified, banned: u.banned }
      });
    }

    await prisma.audit.create({ data: { actorId: 'system', action: 'seed_db', message: 'Seeded identity users for preview/CI' } });

    console.log('Identity seed complete');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Identity seed failed', err);
    process.exit(1);
  }
})();
