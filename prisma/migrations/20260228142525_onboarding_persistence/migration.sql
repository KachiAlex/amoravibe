/*
  Warnings:

  - You are about to drop the column `hashedPassword` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `matchedId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Match` table. All the data in the column will be lost.
  - Added the required column `requesterId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetUserId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'CONNECTED', 'PASSED');

-- CreateEnum
CREATE TYPE "MatchActionType" AS ENUM ('LIKE', 'PASS', 'BLOCK');

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_userId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "hashedPassword",
DROP COLUMN "matchedId",
DROP COLUMN "userId",
ADD COLUMN     "compatibilityScore" INTEGER,
ADD COLUMN     "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requesterId" TEXT NOT NULL,
ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tagsOverlap" INTEGER DEFAULT 0,
ADD COLUMN     "targetUserId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" TEXT,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MatchAction" (
    "id" TEXT NOT NULL,
    "matchId" TEXT,
    "actorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "action" "MatchActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otherUserId" TEXT NOT NULL,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "lastReadAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_match_action_actor_target" ON "MatchAction"("actorId", "targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_conversation_states_user_other" ON "ConversationState"("userId", "otherUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Space_name_key" ON "Space"("name");

-- CreateIndex
CREATE INDEX "idx_match_participants" ON "Match"("requesterId", "targetUserId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAction" ADD CONSTRAINT "MatchAction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAction" ADD CONSTRAINT "MatchAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAction" ADD CONSTRAINT "MatchAction_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationState" ADD CONSTRAINT "ConversationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationState" ADD CONSTRAINT "ConversationState_otherUserId_fkey" FOREIGN KEY ("otherUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
