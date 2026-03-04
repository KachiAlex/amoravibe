import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'onyedika.akoma@gmail.com';

const EXTRA_USERS = [
  // Nigeria-aligned matches for Onyedika
  {
    email: 'chioma.ogechi@example.com',
    displayName: 'Chioma Ogechi',
    name: 'Chioma Ogechi',
    location: 'Lagos, NG',
    job: 'Product Manager',
    about: 'Building fintech for Africa, brunching at Nok, and dancing to alte vibes.',
    interests: ['fintech', 'travel', 'food', 'music'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'amina.balogun@example.com',
    displayName: 'Amina Balogun',
    name: 'Amina Balogun',
    location: 'Abuja, NG',
    job: 'Human Rights Lawyer',
    about: 'Court appearances, Zuma Rock hikes, and mastering new Afrobeats choreo.',
    interests: ['law', 'hiking', 'afrobeats', 'books'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'nkemdilim.obi@example.com',
    displayName: 'Nkemdilim Obi',
    name: 'Nkemdilim Obi',
    location: 'Port Harcourt, NG',
    job: 'Marine Engineer',
    about: 'Offshore rotations, sunrise photography, and HIIT classes in GRA.',
    interests: ['engineering', 'photography', 'fitness', 'travel'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'uchechukwu.adiele@example.com',
    displayName: 'Uchechukwu Adiele',
    name: 'Uchechukwu Adiele',
    location: 'Lagos, NG',
    job: 'Creative Director',
    about: 'Campaign storyboards, Lekki food crawls, and weekend jazz sessions.',
    interests: ['design', 'jazz', 'food', 'travel'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'ifeanyi.okeke@example.com',
    displayName: 'Ifeanyi Okeke',
    name: 'Ifeanyi Okeke',
    location: 'Enugu, NG',
    job: 'Software Engineer',
    about: 'Distributed systems, Nsukka bike trails, and startup mentorship.',
    interests: ['coding', 'startups', 'cycling', 'food'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'harper.wilson@example.com',
    displayName: 'Harper Wilson',
    name: 'Harper Wilson',
    location: 'San Jose, CA',
    job: 'Security Engineer',
    about: 'Breaking and securing things, trail running on weekends.',
    interests: ['security', 'running', 'coffee', 'dogs'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'jackson.lee@example.com',
    displayName: 'Jackson Lee',
    name: 'Jackson Lee',
    location: 'Phoenix, AZ',
    job: 'Civil Engineer',
    about: 'Designing bridges, playing pickup basketball, and grilling.',
    interests: ['engineering', 'basketball', 'bbq', 'travel'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'nina.patel@example.com',
    displayName: 'Nina Patel',
    name: 'Nina Patel',
    location: 'Dallas, TX',
    job: 'Nurse Practitioner',
    about: 'Patient care, Peloton rides, and new brunch spots.',
    interests: ['health', 'cycling', 'brunch', 'reading'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'owen.fischer@example.com',
    displayName: 'Owen Fischer',
    name: 'Owen Fischer',
    location: 'Portland, OR',
    job: 'Product Marketing',
    about: 'Launching products, craft beer tastings, and hiking.',
    interests: ['marketing', 'hiking', 'beer', 'music'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'priya.sharma@example.com',
    displayName: 'Priya Sharma',
    name: 'Priya Sharma',
    location: 'Chicago, IL',
    job: 'Data Analyst',
    about: 'Dashboards by day, dance classes by night.',
    interests: ['data', 'dance', 'coffee', 'travel'],
    gender: 'female',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'rafael.castro@example.com',
    displayName: 'Rafael Castro',
    name: 'Rafael Castro',
    location: 'Miami, FL',
    job: 'Fitness Coach',
    about: 'Strength training, beach runs, and meal prep wizard.',
    interests: ['fitness', 'nutrition', 'beach', 'music'],
    gender: 'male',
    orientation: 'straight',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  // LGBTQ+ set
  {
    email: 'sasha.martinez@example.com',
    displayName: 'Sasha Martinez',
    name: 'Sasha Martinez',
    location: 'Los Angeles, CA',
    job: 'Creative Director',
    about: 'Campaigns, gallery nights, and rooftop sunsets.',
    interests: ['creative', 'art', 'fashion', 'travel'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'devon.park@example.com',
    displayName: 'Devon Park',
    name: 'Devon Park',
    location: 'New York, NY',
    job: 'Musician',
    about: 'Synth pop, live gigs, and late-night ramen.',
    interests: ['music', 'live-shows', 'food', 'cycling'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'juniper.ellis@example.com',
    displayName: 'Juniper Ellis',
    name: 'Juniper Ellis',
    location: 'Vancouver, CA',
    job: 'Content Strategist',
    about: 'Building narratives, hiking forests, and coffee flights.',
    interests: ['content', 'hiking', 'coffee', 'books'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'marco.ortiz@example.com',
    displayName: 'Marco Ortiz',
    name: 'Marco Ortiz',
    location: 'Austin, TX',
    job: 'Chef',
    about: 'Tex-Mex fusion, mezcal tastings, and food truck hopping.',
    interests: ['cooking', 'food', 'music', 'travel'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'tess.murphy@example.com',
    displayName: 'Tess Murphy',
    name: 'Tess Murphy',
    location: 'Dublin, IE',
    job: 'UX Writer',
    about: 'Microcopy nerd, sea swims, and cozy bookstores.',
    interests: ['writing', 'design', 'swimming', 'books'],
    gender: 'female',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
    ],
  },
  {
    email: 'emery.wong@example.com',
    displayName: 'Emery Wong',
    name: 'Emery Wong',
    location: 'Singapore, SG',
    job: 'Cloud Architect',
    about: 'Scaling systems, hawker food hunts, and night cycling.',
    interests: ['cloud', 'cycling', 'food', 'travel'],
    gender: 'male',
    orientation: 'lgbtq',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90',
    photos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90',
    ],
  },
];

async function main() {
  console.log('Seeding additional users and matches...');

  const target = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!target) {
    throw new Error(`Target user not found: ${TARGET_EMAIL}`);
  }

  for (const user of EXTRA_USERS) {
    const created = await prisma.user.upsert({
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

    // Create or update connected match (findFirst because no unique composite)
    const existing = await prisma.match.findFirst({
      where: {
        requesterId: target.id,
        targetUserId: created.id,
      },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          status: MatchStatus.CONNECTED,
          compatibilityScore: 82,
          tagsOverlap: 3,
          isHighlighted: false,
        },
      });
    } else {
      await prisma.match.create({
        data: {
          requesterId: target.id,
          targetUserId: created.id,
          status: MatchStatus.CONNECTED,
          compatibilityScore: 82,
          tagsOverlap: 3,
          isHighlighted: false,
        },
      });
    }
  }

  console.log(`✅ Seeded ${EXTRA_USERS.length} users and matched them to ${TARGET_EMAIL}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
