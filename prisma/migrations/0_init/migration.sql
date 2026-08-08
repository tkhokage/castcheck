-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'actor',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "emailVerified" TIMESTAMP(3),
    "verifyToken" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "result" TEXT NOT NULL DEFAULT 'success',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "professionalEmail" TEXT,
    "professionalPhone" TEXT,
    "location" TEXT,
    "headshotUrl" TEXT,
    "resumeUrl" TEXT,
    "demoReelUrl" TEXT,
    "bio" TEXT,
    "credits" JSONB,
    "skills" JSONB,
    "specialSkills" JSONB,
    "training" JSONB,
    "languages" JSONB,
    "links" JSONB,
    "experienceLevel" TEXT,
    "careerGoals" TEXT,
    "preferredMediums" JSONB,
    "desiredMarkets" JSONB,
    "roleTypes" JSONB,
    "compensationPref" TEXT,
    "productionTypePref" JSONB,
    "availability" TEXT,
    "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
    "representationGoals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "production" TEXT,
    "productionCompany" TEXT,
    "castingEntity" TEXT,
    "role" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "productionType" TEXT,
    "experienceLevel" TEXT,
    "compensation" TEXT NOT NULL,
    "payDetails" TEXT,
    "unionStatus" TEXT,
    "description" TEXT,
    "submissionMethod" TEXT,
    "submissionRequirements" JSONB,
    "deadline" TIMESTAMP(3),
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "verificationState" TEXT NOT NULL DEFAULT 'needs_review',
    "trustLevel" INTEGER NOT NULL DEFAULT 1,
    "riskLikelihood" INTEGER NOT NULL DEFAULT 2,
    "riskImpact" INTEGER NOT NULL DEFAULT 2,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "lastVerifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'published',
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCheck" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskIndicator" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,

    CONSTRAINT "RiskIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "submissionDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "auditionDate" TIMESTAMP(3),
    "contact" TEXT,
    "notes" TEXT,
    "materialsSubmitted" JSONB,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "representationSpecialties" JSONB,
    "marketsServed" JSONB,
    "submissionMethod" TEXT,
    "submissionRequirements" JSONB,
    "commission" TEXT,
    "fees" TEXT,
    "careerLevel" JSONB,
    "specialties" JSONB,
    "businessInfo" TEXT,
    "verificationState" TEXT NOT NULL DEFAULT 'needs_review',
    "trustLevel" INTEGER NOT NULL DEFAULT 1,
    "lastVerifiedAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "internalNotes" TEXT,
    "resolution" TEXT,
    "assignedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskRegisterEntry" (
    "id" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "asset" TEXT,
    "threat" TEXT,
    "vulnerability" TEXT,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "control" TEXT NOT NULL,
    "residual" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "RiskRegisterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "affectedAssets" TEXT,
    "summary" TEXT NOT NULL,
    "evidence" TEXT,
    "parties" TEXT,
    "immediateActions" TEXT,
    "recommendedActions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lessonsLearned" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActorProfile_userId_key" ON "ActorProfile"("userId");

-- CreateIndex
CREATE INDEX "Opportunity_type_idx" ON "Opportunity"("type");

-- CreateIndex
CREATE INDEX "Opportunity_location_idx" ON "Opportunity"("location");

-- CreateIndex
CREATE INDEX "Opportunity_verificationState_idx" ON "Opportunity"("verificationState");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "SavedOpportunity"("userId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_opportunityId_key" ON "Application"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "Agency_location_idx" ON "Agency"("location");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_reference_key" ON "Incident"("reference");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActorProfile" ADD CONSTRAINT "ActorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskIndicator" ADD CONSTRAINT "RiskIndicator_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedId_fkey" FOREIGN KEY ("assignedId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

