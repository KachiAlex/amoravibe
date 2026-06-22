-- Migration: Add new columns and tables for Phase 1-3 features

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "prompts" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedPhoto" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "boostExpiresAt" TIMESTAMP(3);

-- Add new columns to MatchAction table
ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "comment" TEXT;
ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "targetType" TEXT DEFAULT 'profile';
ALTER TABLE "MatchAction" ADD COLUMN IF NOT EXISTS "targetPrompt" TEXT;

-- Create Notification table
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
CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "idx_notification_createdAt" ON "Notification"("createdAt");

-- Create Story table
CREATE TABLE IF NOT EXISTS "Story" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_story_user_expires" ON "Story"("userId", "expiresAt");
CREATE INDEX IF NOT EXISTS "idx_story_expiresAt" ON "Story"("expiresAt");
