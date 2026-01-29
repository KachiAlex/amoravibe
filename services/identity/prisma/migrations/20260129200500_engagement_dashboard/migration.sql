-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('man', 'woman', 'non_binary', 'trans_man', 'trans_woman', 'self_describe');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('heterosexual', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'queer');

-- CreateEnum
CREATE TYPE "DiscoverySpace" AS ENUM ('straight', 'lgbtq', 'both');

-- CreateEnum
CREATE TYPE "MatchPreference" AS ENUM ('men', 'women', 'everyone');

-- CreateEnum
CREATE TYPE "VisibilityStatus" AS ENUM ('limited', 'trusted', 'restricted');

-- CreateEnum
CREATE TYPE "LikeEdgeStatus" AS ENUM ('pending', 'matched', 'dismissed');

-- CreateEnum
CREATE TYPE "VerificationIntent" AS ENUM ('verify_now', 'skip');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'pending', 'verified', 'flagged');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('verification_initiated', 'verification_status_changed', 'orientation_pool_denied', 'device_alert_created');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'system', 'service', 'admin');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('user', 'verification', 'device_fingerprint', 'trust_profile', 'moderation_case');

-- CreateEnum
CREATE TYPE "AuditExportStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "AuditPurgeStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ModerationSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "RiskSignalType" AS ENUM ('device_fingerprint', 'auth_pattern', 'behavior_anomaly', 'content_violation', 'manual_report');

-- CreateEnum
CREATE TYPE "RiskSignalChannel" AS ENUM ('device_pipeline', 'auth_service', 'moderation_service', 'manual_review', 'external_feed');

-- CreateEnum
CREATE TYPE "RiskSignalSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "AnalyticsPiiTier" AS ENUM ('direct', 'hashed', 'aggregate');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "orientation" "Orientation" NOT NULL,
    "orientationPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "discoverySpace" "DiscoverySpace" NOT NULL,
    "matchPreferences" "MatchPreference"[] DEFAULT ARRAY[]::"MatchPreference"[],
    "city" TEXT NOT NULL,
    "bio" TEXT,
    "photos" JSONB,
    "verificationIntent" "VerificationIntent" NOT NULL DEFAULT 'skip',
    "trustScore" INTEGER NOT NULL DEFAULT 50,
    "visibility" "VisibilityStatus" NOT NULL DEFAULT 'limited',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceFingerprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "hash" TEXT NOT NULL,
    "userAgent" TEXT,
    "riskLabel" TEXT,
    "signals" JSONB,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verificationId" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" JSONB,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'system',
    "actorId" TEXT,
    "entityType" "AuditEntityType",
    "entityId" TEXT,
    "channel" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditExportRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AuditExportStatus" NOT NULL DEFAULT 'pending',
    "storageLocation" TEXT,
    "failureReason" TEXT,
    "payload" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "AuditExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditPurgeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AuditPurgeStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "AuditPurgeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsUserSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashedEmail" TEXT,
    "hashedPhone" TEXT,
    "orientation" "Orientation" NOT NULL,
    "discoverySpace" "DiscoverySpace" NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "piiTier" "AnalyticsPiiTier" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsUserSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsTrustSignalFact" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "userId" TEXT,
    "hashedUserId" TEXT,
    "signalType" "RiskSignalType" NOT NULL,
    "channel" "RiskSignalChannel" NOT NULL,
    "severity" "RiskSignalSeverity" NOT NULL,
    "score" DOUBLE PRECISION,
    "piiTier" "AnalyticsPiiTier" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsTrustSignalFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsModerationFact" (
    "id" TEXT NOT NULL,
    "moderationEventId" TEXT NOT NULL,
    "userId" TEXT,
    "hashedUserId" TEXT,
    "severity" "ModerationSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "piiTier" "AnalyticsPiiTier" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsModerationFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsIngestionRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "checkpoint" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsIngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceFingerprintId" TEXT,
    "severity" "ModerationSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskSignal" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "relatedUserId" TEXT,
    "deviceFingerprintId" TEXT,
    "type" "RiskSignalType" NOT NULL,
    "channel" "RiskSignalChannel" NOT NULL,
    "severity" "RiskSignalSeverity" NOT NULL,
    "metadata" JSONB,
    "features" JSONB,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "RiskSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskProfile" (
    "userId" TEXT NOT NULL,
    "trustScore" INTEGER NOT NULL DEFAULT 50,
    "metrics" JSONB,
    "lastEvaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RiskModelRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT,
    "modelVersion" TEXT NOT NULL,
    "algorithm" TEXT,
    "features" JSONB,
    "output" JSONB,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskModelRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLike" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "LikeEdgeStatus" NOT NULL DEFAULT 'pending',
    "highlight" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "savedAt" TIMESTAMP(3),
    "nudgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "helper" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumPerk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "helper" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "helper" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsShortcut" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "helper" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "tone" TEXT DEFAULT 'default',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettingsShortcut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoverFilter" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "helper" TEXT NOT NULL,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoverFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Verification_userId_idx" ON "Verification"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_verificationId_idx" ON "AuditEvent"("verificationId");

-- CreateIndex
CREATE INDEX "AuditEvent_actorType_idx" ON "AuditEvent"("actorType");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_expiresAt_idx" ON "AuditEvent"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditExportRequest_userId_idx" ON "AuditExportRequest"("userId");

-- CreateIndex
CREATE INDEX "AuditExportRequest_status_idx" ON "AuditExportRequest"("status");

-- CreateIndex
CREATE INDEX "AuditPurgeRequest_userId_idx" ON "AuditPurgeRequest"("userId");

-- CreateIndex
CREATE INDEX "AuditPurgeRequest_status_idx" ON "AuditPurgeRequest"("status");

-- CreateIndex
CREATE INDEX "AnalyticsUserSnapshot_snapshotDate_idx" ON "AnalyticsUserSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsUserSnapshot_userId_snapshotDate_key" ON "AnalyticsUserSnapshot"("userId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsTrustSignalFact_signalId_key" ON "AnalyticsTrustSignalFact"("signalId");

-- CreateIndex
CREATE INDEX "AnalyticsTrustSignalFact_userId_idx" ON "AnalyticsTrustSignalFact"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsTrustSignalFact_occurredAt_idx" ON "AnalyticsTrustSignalFact"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsModerationFact_moderationEventId_key" ON "AnalyticsModerationFact"("moderationEventId");

-- CreateIndex
CREATE INDEX "AnalyticsModerationFact_userId_idx" ON "AnalyticsModerationFact"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsModerationFact_occurredAt_idx" ON "AnalyticsModerationFact"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsIngestionRun_jobName_key" ON "AnalyticsIngestionRun"("jobName");

-- CreateIndex
CREATE INDEX "ModerationEvent_userId_idx" ON "ModerationEvent"("userId");

-- CreateIndex
CREATE INDEX "ModerationEvent_deviceFingerprintId_idx" ON "ModerationEvent"("deviceFingerprintId");

-- CreateIndex
CREATE INDEX "RiskSignal_userId_idx" ON "RiskSignal"("userId");

-- CreateIndex
CREATE INDEX "RiskSignal_relatedUserId_idx" ON "RiskSignal"("relatedUserId");

-- CreateIndex
CREATE INDEX "RiskSignal_deviceFingerprintId_idx" ON "RiskSignal"("deviceFingerprintId");

-- CreateIndex
CREATE INDEX "RiskSignal_type_idx" ON "RiskSignal"("type");

-- CreateIndex
CREATE INDEX "RiskModelRun_userId_idx" ON "RiskModelRun"("userId");

-- CreateIndex
CREATE INDEX "RiskModelRun_signalId_idx" ON "RiskModelRun"("signalId");

-- CreateIndex
CREATE INDEX "UserLike_senderId_idx" ON "UserLike"("senderId");

-- CreateIndex
CREATE INDEX "UserLike_receiverId_idx" ON "UserLike"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_key" ON "NotificationPreference"("userId", "channel");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceFingerprint" ADD CONSTRAINT "DeviceFingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditExportRequest" ADD CONSTRAINT "AuditExportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPurgeRequest" ADD CONSTRAINT "AuditPurgeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationEvent" ADD CONSTRAINT "ModerationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationEvent" ADD CONSTRAINT "ModerationEvent_deviceFingerprintId_fkey" FOREIGN KEY ("deviceFingerprintId") REFERENCES "DeviceFingerprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSignal" ADD CONSTRAINT "RiskSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSignal" ADD CONSTRAINT "RiskSignal_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSignal" ADD CONSTRAINT "RiskSignal_deviceFingerprintId_fkey" FOREIGN KEY ("deviceFingerprintId") REFERENCES "DeviceFingerprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskProfile" ADD CONSTRAINT "RiskProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskModelRun" ADD CONSTRAINT "RiskModelRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskModelRun" ADD CONSTRAINT "RiskModelRun_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "RiskSignal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
