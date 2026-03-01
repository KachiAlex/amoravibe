/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('../../../prisma/node_modules/.prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seedUsers = [
  {
    id: 'admin@amoravibe.com',
    email: 'admin@amoravibe.com',
    name: 'Site Admin',
    displayName: 'Admin',
    role: 'admin',
    isVerified: true,
    onboardingCompleted: true,
    interests: ['ops', 'safety'],
    about: 'Primary admin account for dashboards.',
  },
  {
    id: 'trust.agent@amoravibe.com',
    email: 'trust.agent@amoravibe.com',
    name: 'Trust Agent',
    displayName: 'Trust Agent',
    role: 'moderator',
    isVerified: true,
    onboardingCompleted: true,
    interests: ['trust', 'support'],
    about: 'Handles trust overrides and escalations.',
  },
  {
    id: 'seeduser1@local.test',
    email: 'seeduser1@local.test',
    name: 'Seed User 1',
    displayName: 'Seed User 1',
    role: 'user',
    isVerified: true,
    onboardingCompleted: true,
    interests: ['music', 'travel'],
    about: 'Sample member for matching flows.',
  },
  {
    id: 'seeduser2@local.test',
    email: 'seeduser2@local.test',
    name: 'Seed User 2',
    displayName: 'Seed User 2',
    role: 'user',
    isVerified: false,
    onboardingCompleted: false,
    interests: ['movies', 'fitness'],
    about: 'Another sample member.',
  },
];

const seedSpaces = [
  {
    id: 'space_global',
    name: 'Global Community',
    description: 'Default space for all members to connect.',
  },
  {
    id: 'space_events',
    name: 'Events Lab',
    description: 'Experiments and pilot events.',
  },
];

async function main() {
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Clearing tables');
  await prisma.matchAction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationState.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.user.deleteMany();
  await prisma.space.deleteMany();

  console.log('Creating spaces');
  for (const space of seedSpaces) {
    await prisma.space.create({ data: space });
    console.log(`Created space ${space.name}`);
  }

  console.log('Creating users');
  for (const user of seedUsers) {
    await prisma.user.create({
      data: {
        ...user,
        hashedPassword,
      },
    });
    console.log(`Created user ${user.email}`);
  }

  console.log('Creating sample match');
  await prisma.match.create({
    data: {
      requesterId: seedUsers[2].id,
      targetUserId: seedUsers[3].id,
      status: 'CONNECTED',
      compatibilityScore: 82,
      tagsOverlap: 6,
      isHighlighted: true,
    },
  });

  console.log('Creating audit trail');
  await prisma.audit.createMany({
    data: [
      {
        actorId: seedUsers[0].id,
        action: 'seed_db',
        message: 'Seeded initial admin and member accounts',
      },
      {
        actorId: seedUsers[1].id,
        action: 'trust_override',
        targetId: seedUsers[2].id,
        message: 'Verified sample user for dashboard smoke tests',
      },
    ],
  });

  console.log('Seed complete. Default password:', password);
}

main()
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
