-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'DOSEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Pelajar demo',
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "preference" TEXT NOT NULL DEFAULT 'bertahap',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Session" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "LearningDomain" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "LearningDomain_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Article" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "domainSlug" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "body" JSONB NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "ConceptRelationship" (
    "id" TEXT NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "toSlug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,

    CONSTRAINT "ConceptRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL,

    CONSTRAINT "AcademicSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCitation" (
    "id" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "locator" TEXT NOT NULL,

    CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningBlock" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "objectives" JSONB NOT NULL,

    CONSTRAINT "LearningBlock_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "CaseScenario" (
    "slug" TEXT NOT NULL,
    "blockSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sources" JSONB NOT NULL,

    CONSTRAINT "CaseScenario_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "SimulationQuestion" (
    "id" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,

    CONSTRAINT "SimulationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL,
    "caseVersion" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "score" INTEGER,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "SimulationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL,
    "entries" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'SELF_REVIEW',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptRelationship_fromSlug_toSlug_key" ON "ConceptRelationship"("fromSlug", "toSlug");

-- CreateIndex
CREATE UNIQUE INDEX "SourceCitation_articleSlug_sourceId_key" ON "SourceCitation"("articleSlug", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationQuestion_caseSlug_position_key" ON "SimulationQuestion"("caseSlug", "position");

-- CreateIndex
CREATE INDEX "SimulationAttempt_userId_caseSlug_status_idx" ON "SimulationAttempt"("userId", "caseSlug", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_articleSlug_key" ON "LearningProgress"("userId", "articleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RubricAssessment_userId_caseSlug_key" ON "RubricAssessment"("userId", "caseSlug");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_domainSlug_fkey" FOREIGN KEY ("domainSlug") REFERENCES "LearningDomain"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptRelationship" ADD CONSTRAINT "ConceptRelationship_fromSlug_fkey" FOREIGN KEY ("fromSlug") REFERENCES "Article"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptRelationship" ADD CONSTRAINT "ConceptRelationship_toSlug_fkey" FOREIGN KEY ("toSlug") REFERENCES "Article"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation" ADD CONSTRAINT "SourceCitation_articleSlug_fkey" FOREIGN KEY ("articleSlug") REFERENCES "Article"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation" ADD CONSTRAINT "SourceCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseScenario" ADD CONSTRAINT "CaseScenario_blockSlug_fkey" FOREIGN KEY ("blockSlug") REFERENCES "LearningBlock"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationQuestion" ADD CONSTRAINT "SimulationQuestion_caseSlug_fkey" FOREIGN KEY ("caseSlug") REFERENCES "CaseScenario"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationAttempt" ADD CONSTRAINT "SimulationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationAttempt" ADD CONSTRAINT "SimulationAttempt_caseSlug_fkey" FOREIGN KEY ("caseSlug") REFERENCES "CaseScenario"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_articleSlug_fkey" FOREIGN KEY ("articleSlug") REFERENCES "Article"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricAssessment" ADD CONSTRAINT "RubricAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
