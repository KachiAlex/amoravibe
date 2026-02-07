import {
  PrismaClient,
} from '@prisma/client';
import { hashPassword } from '../src/modules/user/password.utils';

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  phone?: string;
  legalName: string;
  displayName: string;
  password: string;
  gender: string;
  orientation: string;
  matchPreferences: string[];
  discoverySpace: string;
  city: string;
  bio: string;
  photos: string[];
  trustScore: number;
  isVerified?: boolean;
  visibility?: string;
};

const MOCK_USERS: SeedUser[] = [
  {
    email: 'maya.lopez@example.com',
    legalName: 'Maya Lopez',
    displayName: 'Maya',
    password: 'Passw0rd!1',
    gender: 'woman',
    orientation: 'bisexual',
    matchPreferences: ['everyone'],
    discoverySpace: 'both',
    city: 'Brooklyn, NY',
    bio: 'Coffee nerd, gallery hopper, runs the park loop on Sundays.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 82,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'devon.cho@example.com',
    legalName: 'Devon Cho',
    displayName: 'Devon',
    password: 'Passw0rd!1',
    gender: 'man',
    orientation: 'pansexual',
    matchPreferences: ['everyone'],
    discoverySpace: 'both',
    city: 'Austin, TX',
    bio: 'Product designer, bikepacker, cooking kimchi jjigae on weekends.',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 76,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'amira.khan@example.com',
    legalName: 'Amira Khan',
    displayName: 'Amira',
    password: 'Passw0rd!1',
    gender: 'woman',
    orientation: 'heterosexual',
    matchPreferences: ['men'],
    discoverySpace: 'straight',
    city: 'San Francisco, CA',
    bio: 'Climate fintech PM. Loves ceramics and cold plunges.',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 88,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'lucas.reed@example.com',
    legalName: 'Lucas Reed',
    displayName: 'Lucas',
    password: 'Passw0rd!1',
    gender: 'man',
    orientation: 'heterosexual',
    matchPreferences: ['women'],
    discoverySpace: 'straight',
    city: 'Denver, CO',
    bio: 'Ski weekends, bouldering, and sourdough experiments.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 72,
    visibility: 'trusted',
  },
  {
    email: 'sofia.mendes@example.com',
    legalName: 'Sofia Mendes',
    displayName: 'Sofia',
    password: 'Passw0rd!1',
    gender: 'woman',
    orientation: 'lesbian',
    matchPreferences: ['women'],
    discoverySpace: 'lgbtq',
    city: 'Seattle, WA',
    bio: 'Data viz geek, rainy hikes, vinyl collector.',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 79,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'marcus.king@example.com',
    legalName: 'Marcus King',
    displayName: 'Marcus',
    password: 'Passw0rd!1',
    gender: 'man',
    orientation: 'gay',
    matchPreferences: ['men'],
    discoverySpace: 'lgbtq',
    city: 'Chicago, IL',
    bio: 'Urban gardener, improv fan, always up for live jazz.',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 74,
    visibility: 'trusted',
  },
  {
    email: 'priya.rao@example.com',
    legalName: 'Priya Rao',
    displayName: 'Priya',
    password: 'Passw0rd!1',
    gender: 'woman',
    orientation: 'pansexual',
    matchPreferences: ['everyone'],
    discoverySpace: 'both',
    city: 'Los Angeles, CA',
    bio: 'Documentary photographer. Road trips and late-night ramen.',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508216310972-3ea39cfa08fa?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 85,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'diego.ramirez@example.com',
    legalName: 'Diego Ramirez',
    displayName: 'Diego',
    password: 'Passw0rd!1',
    gender: 'man',
    orientation: 'bisexual',
    matchPreferences: ['everyone'],
    discoverySpace: 'both',
    city: 'Miami, FL',
    bio: 'Surf at sunrise, salsa at night. Building fintech tools by day.',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 70,
    visibility: 'trusted',
  },
  {
    email: 'leah.stone@example.com',
    legalName: 'Leah Stone',
    displayName: 'Leah',
    password: 'Passw0rd!1',
    gender: 'woman',
    orientation: 'queer',
    matchPreferences: ['everyone'],
    discoverySpace: 'lgbtq',
    city: 'Portland, OR',
    bio: 'Community builder, zines, trail running with my dog.',
    photos: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 83,
    isVerified: true,
    visibility: 'trusted',
  },
  {
    email: 'kai.tan@example.com',
    legalName: 'Kai Tan',
    displayName: 'Kai',
    password: 'Passw0rd!1',
    gender: 'non_binary',
    orientation: 'pansexual',
    matchPreferences: ['everyone'],
    discoverySpace: 'both',
    city: 'New York, NY',
    bio: 'Creative coder, ambient music, bubble tea pilgrimages.',
    photos: [
      'https://images.unsplash.com/photo-1517046220202-51e0e8b2236c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    ],
    trustScore: 80,
    visibility: 'trusted',
  },
];

const ADMIN_USER: SeedUser = {
  email: 'admin@lovedate.local',
  legalName: 'Admin User',
  displayName: 'Admin',
  password: 'Admin!234',
  gender: 'man',
  orientation: 'heterosexual',
  matchPreferences: ['women'],
  discoverySpace: 'both',
  city: 'Remote',
  bio: 'Platform moderator account.',
  photos: [],
  trustScore: 95,
  isVerified: true,
  visibility: 'trusted',
};

async function seedUser(input: SeedUser) {
  const passwordHash = hashPassword(input.password);
  const matchPrefsJson = JSON.stringify(input.matchPreferences);
  const photosJson = JSON.stringify(input.photos);
  
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      displayName: input.displayName,
      passwordHash,
      gender: input.gender as any,
      orientation: input.orientation as any,
      matchPreferences: matchPrefsJson as any,
      discoverySpace: input.discoverySpace as any,
      bio: input.bio,
      photos: photosJson,
      trustScore: input.trustScore,
      isVerified: input.isVerified ?? false,
      visibility: (input.visibility ?? 'limited') as any,
    },
    create: {
      legalName: input.legalName,
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      gender: input.gender as any,
      orientation: input.orientation as any,
      matchPreferences: matchPrefsJson as any,
      discoverySpace: input.discoverySpace as any,
      city: input.city,
      bio: input.bio,
      photos: photosJson,
      trustScore: input.trustScore,
      isVerified: input.isVerified ?? false,
      visibility: (input.visibility ?? 'limited') as any,
      dateOfBirth: new Date('1995-01-01'),
    },
  });
}

async function main() {
  const targets = [...MOCK_USERS, ADMIN_USER];
  for (const user of targets) {
    const result = await seedUser(user);
    // eslint-disable-next-line no-console
    console.log(`Seeded ${result.displayName} (${result.email})`);
  }
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
