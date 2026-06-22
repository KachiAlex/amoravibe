import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Add columns to User table
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "prompts" JSONB;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedPhoto" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "boostExpiresAt" TIMESTAMP(3);`);

    // Add columns to MatchAction table
    await prisma.$executeRawUnsafe(`ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "comment" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "targetType" TEXT DEFAULT 'profile';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "targetPrompt" TEXT;`);

    // Create Notification table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT,
        "data" JSONB,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification"("userId", "read");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_notification_createdAt" ON "Notification"("createdAt");`);

    // Create Story table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Story" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "mediaUrl" TEXT NOT NULL,
        "caption" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_story_user_expires" ON "Story"("userId", "expiresAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_story_expiresAt" ON "Story"("expiresAt");`);

    // Add foreign key constraint to Story table (idempotent - will fail silently if already exists)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
    } catch {
      // Constraint likely already exists, ignore
    }

    return NextResponse.json({ success: true, message: 'Migration applied successfully' });
  } catch (err: any) {
    console.error('[Migrate] Error:', err);
    return NextResponse.json({ error: 'Migration failed', details: err.message }, { status: 500 });
  }
}
