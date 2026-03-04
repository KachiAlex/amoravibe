import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERS = [
  {
    email: 'amelia.chen@example.com',
    displayName: 'Amelia Chen',
    name: 'Amelia Chen',
    location: 'San Francisco, CA',
    job: 'Product Designer',
    about: 'Designing human-centered experiences and traveling whenever I can.',
    interests: ['design', 'photography', 'travel', 'coffee'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
    ],
  },
  {
    email: 'noah.james@example.com',
    displayName: 'Noah James',
    name: 'Noah James',
    location: 'Austin, TX',
    job: 'Software Engineer',
    about: 'Building scalable systems and cooking Texas BBQ on weekends.',
    interests: ['coding', 'bbq', 'hiking', 'gaming'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=90',
    ],
  },
  {
    email: 'sofia.rivera@example.com',
    displayName: 'Sofia Rivera',
    name: 'Sofia Rivera',
    location: 'Miami, FL',
    job: 'Marketing Strategist',
    about: 'Storytelling, salsa dancing, and sunsets by the beach.',
    interests: ['marketing', 'dance', 'fitness', 'travel'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'liam.thompson@example.com',
    displayName: 'Liam Thompson',
    name: 'Liam Thompson',
    location: 'New York, NY',
    job: 'Finance Analyst',
    about: 'Numbers by day, jazz enthusiast by night.',
    interests: ['finance', 'jazz', 'running', 'foodie'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'olivia.morgan@example.com',
    displayName: 'Olivia Morgan',
    name: 'Olivia Morgan',
    location: 'Seattle, WA',
    job: 'UX Researcher',
    about: 'Curious mind exploring human behavior and mountain trails.',
    interests: ['research', 'hiking', 'reading', 'tea'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'mason.brooks@example.com',
    displayName: 'Mason Brooks',
    name: 'Mason Brooks',
    location: 'Denver, CO',
    job: 'Data Scientist',
    about: 'Skiing powder slopes and decoding messy datasets.',
    interests: ['data', 'skiing', 'cycling', 'coffee'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ava.roberts@example.com',
    displayName: 'Ava Roberts',
    name: 'Ava Roberts',
    location: 'Los Angeles, CA',
    job: 'Actor',
    about: 'Film sets, yoga mornings, and discovering new cafes.',
    interests: ['acting', 'yoga', 'coffee', 'films'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ethan.wright@example.com',
    displayName: 'Ethan Wright',
    name: 'Ethan Wright',
    location: 'Chicago, IL',
    job: 'Architect',
    about: 'Designing sustainable spaces and exploring city architecture.',
    interests: ['architecture', 'travel', 'basketball', 'art'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'mia.davies@example.com',
    displayName: 'Mia Davies',
    name: 'Mia Davies',
    location: 'Portland, OR',
    job: 'Photographer',
    about: 'Capturing light, forests, and candid smiles.',
    interests: ['photography', 'hiking', 'coffee', 'art'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'lucas.hughes@example.com',
    displayName: 'Lucas Hughes',
    name: 'Lucas Hughes',
    location: 'Boston, MA',
    job: 'Doctor',
    about: 'Emergency medicine, marathon training, and volunteering.',
    interests: ['health', 'running', 'volunteering', 'reading'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  // LGBTQ+ users
  {
    email: 'aria.torres@example.com',
    displayName: 'Aria Torres',
    name: 'Aria Torres',
    location: 'San Diego, CA',
    job: 'Illustrator',
    about: 'Colorful worlds, surf mornings, and plant mom duties.',
    interests: ['illustration', 'surfing', 'plants', 'music'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'kai.nguyen@example.com',
    displayName: 'Kai Nguyen',
    name: 'Kai Nguyen',
    location: 'Seattle, WA',
    job: 'DevOps Engineer',
    about: 'Clouds by day, climbing walls by night.',
    interests: ['devops', 'climbing', 'coffee', 'gaming'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'zoe.smith@example.com',
    displayName: 'Zoe Smith',
    name: 'Zoe Smith',
    location: 'Brooklyn, NY',
    job: 'Writer',
    about: 'Poetry nights, indie films, and park picnics.',
    interests: ['writing', 'films', 'poetry', 'coffee'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'leo.jackson@example.com',
    displayName: 'Leo Jackson',
    name: 'Leo Jackson',
    location: 'Atlanta, GA',
    job: 'Chef',
    about: 'Southern fusion cuisine and farmer’s market explorer.',
    interests: ['cooking', 'food', 'music', 'travel'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ivy.kim@example.com',
    displayName: 'Ivy Kim',
    name: 'Ivy Kim',
    location: 'Toronto, CA',
    job: 'Product Manager',
    about: 'Building products with empathy, loves k-dramas and matcha.',
    interests: ['product', 'reading', 'travel', 'kpop'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'nate.ross@example.com',
    displayName: 'Nate Ross',
    name: 'Nate Ross',
    location: 'Vancouver, CA',
    job: 'Videographer',
    about: 'Documentary filmmaking and mountain biking.',
    interests: ['video', 'biking', 'nature', 'coffee'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ruby.adams@example.com',
    displayName: 'Ruby Adams',
    name: 'Ruby Adams',
    location: 'London, UK',
    job: 'UI Engineer',
    about: 'Frontend craft, board games, and rainy walks.',
    interests: ['frontend', 'games', 'tea', 'travel'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'samuel.green@example.com',
    displayName: 'Samuel Green',
    name: 'Samuel Green',
    location: 'Dublin, IE',
    job: 'Research Scientist',
    about: 'AI research, pub trivia, and long-distance runs.',
    interests: ['ai', 'running', 'trivia', 'music'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'taylor.bennett@example.com',
    displayName: 'Taylor Bennett',
    name: 'Taylor Bennett',
    location: 'Sydney, AU',
    job: 'Event Planner',
    about: 'Curating unforgettable experiences and beach runs at dawn.',
    interests: ['events', 'beach', 'running', 'food'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'owen.clark@example.com',
    displayName: 'Owen Clark',
    name: 'Owen Clark',
    location: 'Berlin, DE',
    job: 'Musician',
    about: 'Synthwave producer, vinyl collector, night cyclist.',
    interests: ['music', 'cycling', 'vinyl', 'coffee'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ella.martin@example.com',
    displayName: 'Ella Martin',
    name: 'Ella Martin',
    location: 'Paris, FR',
    job: 'Chef de Partie',
    about: 'Pastry lover, café hopper, and art museum regular.',
    interests: ['cooking', 'art', 'travel', 'coffee'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  // Nigeria-focused profiles for Onyedika
  {
    email: 'chioma.ogechi@example.com',
    displayName: 'Chioma Ogechi',
    name: 'Chioma Ogechi',
    location: 'Lagos, NG',
    job: 'Product Manager',
    about: 'Building fintech solutions for African markets. Sundays are for jollof experiments and beach hangouts.',
    interests: ['fintech', 'travel', 'food', 'music'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'amina.balogun@example.com',
    displayName: 'Amina Balogun',
    name: 'Amina Balogun',
    location: 'Abuja, NG',
    job: 'Human Rights Lawyer',
    about: 'Advocating for social justice, planning weekend hikes, and curating soulful Afrobeats playlists.',
    interests: ['law', 'hiking', 'afrobeats', 'books'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'ifeanyi.okeke@example.com',
    displayName: 'Ifeanyi Okeke',
    name: 'Ifeanyi Okeke',
    location: 'Enugu, NG',
    job: 'Software Engineer',
    about: 'Distributed systems by day, palm wine sommelier by night. Passionate about local startups.',
    interests: ['coding', 'startups', 'cycling', 'food'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'nkemdilim.obi@example.com',
    displayName: 'Nkemdilim Obi',
    name: 'Nkemdilim Obi',
    location: 'Port Harcourt, NG',
    job: 'Marine Engineer',
    about: 'Keeping offshore rigs humming, capturing sunrise photos on the Niger Delta.',
    interests: ['engineering', 'photography', 'fitness', 'travel'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    ],
  },
  {
    email: 'uchechukwu.adiele@example.com',
    displayName: 'Uchechukwu Adiele',
    name: 'Uchechukwu Adiele',
    location: 'Lagos, NG',
    job: 'Creative Director',
    about: 'Leading pan-African campaigns, hosting underground jazz nights, and exploring Lekki restaurants.',
    interests: ['design', 'jazz', 'food', 'travel'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    ],
  },
];

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

  // Seed users
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        ...user,
        onboardingCompleted: true,
        onboardingStep: 'complete',
      },
      create: {
        ...user,
        onboardingCompleted: true,
        onboardingStep: 'complete',
      },
    });
  }

  console.log(`✅ Seeded ${USERS.length} users`);

  await ensureGeneralRoom(straightSpace.id, 'straight', straightSpace.name);
  await ensureGeneralRoom(lgbtqSpace.id, 'lgbtq', lgbtqSpace.name);
}

async function ensureGeneralRoom(spaceId: string, orientation: string, spaceName: string) {
  const existing = await prisma.room.findFirst({
    where: { spaceId, isGeneral: true },
  });
  if (existing) {
    return existing;
  }
  const creator = await prisma.user.findFirst({
    where: { orientation },
    select: { id: true },
  });
  if (!creator) {
    console.warn(`⚠️ Unable to seed general room for ${spaceName} — no user with orientation ${orientation}`);
    return null;
  }
  const room = await prisma.room.create({
    data: {
      name: 'General Chat',
      description: `Open chat for everyone in ${spaceName}. Share updates, wins, and check-ins.`,
      spaceId,
      creatorId: creator.id,
      isGeneral: true,
      isPublic: true,
    },
  });
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: creator.id,
    },
  });
  console.log(`✅ Seeded general room for ${spaceName}`);
  return room;
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
