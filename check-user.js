const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        displayName: true,
        hashedPassword: true,
        createdAt: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      console.log(`❌ User NOT found: ${email}`);
      return false;
    }

    console.log(`✅ User FOUND: ${email}`);
    console.log(JSON.stringify(user, null, 2));
    return true;
  } catch (error) {
    console.error('Database error:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'onyedika.akoma@gmail.com';
checkUser(email);
