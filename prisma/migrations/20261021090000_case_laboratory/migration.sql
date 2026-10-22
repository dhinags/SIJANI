-- AlterTable
ALTER TABLE "CaseScenario" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Etika profesional',
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'Terbimbing',
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "isDemoSeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "SimulationAttempt" ADD COLUMN     "caseSnapshot" JSONB;

-- CreateTable
CREATE TABLE "CaseVersion" (
    "caseSlug" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "instructorGuide" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseVersion_pkey" PRIMARY KEY ("caseSlug","number")
);

-- CreateTable
CREATE TABLE "RubricVersion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "provisional" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RubricVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrittenSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL,
    "caseVersion" INTEGER NOT NULL,
    "rubricVersionId" TEXT NOT NULL,
    "rubricSnapshot" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "feedbackReadAt" TIMESTAMP(3),

    CONSTRAINT "WrittenSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrittenRevision" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WrittenRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormativeReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "ratings" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '',
    "strengths" TEXT NOT NULL DEFAULT '',
    "improvements" TEXT NOT NULL DEFAULT '',
    "nextSteps" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT 'REVIEWED',
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "amendsId" TEXT,

    CONSTRAINT "FormativeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseReviewGrant" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL,
    "grantedByLabel" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseReviewGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabAudit" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceSection" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "locator" TEXT NOT NULL DEFAULT '',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "kind" TEXT NOT NULL DEFAULT 'ORIENTATION',

    CONSTRAINT "ReferenceSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseReference" (
    "caseSlug" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "dimensionIds" TEXT[],

    CONSTRAINT "CaseReference_pkey" PRIMARY KEY ("caseSlug","sourceId")
);

-- CreateTable
CREATE TABLE "ReferenceProgress" (
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceProgress_pkey" PRIMARY KEY ("userId","sectionId")
);

-- CreateIndex
CREATE INDEX "WrittenSubmission_userId_caseSlug_createdAt_idx" ON "WrittenSubmission"("userId", "caseSlug", "createdAt");

-- CreateIndex
CREATE INDEX "WrittenSubmission_status_submittedAt_idx" ON "WrittenSubmission"("status", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WrittenRevision_submissionId_number_key" ON "WrittenRevision"("submissionId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "FormativeReview_amendsId_key" ON "FormativeReview"("amendsId");

-- CreateIndex
CREATE INDEX "FormativeReview_submissionId_status_idx" ON "FormativeReview"("submissionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FormativeReview_submissionId_reviewerId_number_key" ON "FormativeReview"("submissionId", "reviewerId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "CaseReviewGrant_reviewerId_studentId_caseSlug_key" ON "CaseReviewGrant"("reviewerId", "studentId", "caseSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceSection_sourceId_position_key" ON "ReferenceSection"("sourceId", "position");

-- AddForeignKey
ALTER TABLE "CaseVersion" ADD CONSTRAINT "CaseVersion_caseSlug_fkey" FOREIGN KEY ("caseSlug") REFERENCES "CaseScenario"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_caseSlug_caseVersion_fkey" FOREIGN KEY ("caseSlug", "caseVersion") REFERENCES "CaseVersion"("caseSlug", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_rubricVersionId_fkey" FOREIGN KEY ("rubricVersionId") REFERENCES "RubricVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenSubmission" ADD CONSTRAINT "WrittenSubmission_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WrittenSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrittenRevision" ADD CONSTRAINT "WrittenRevision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WrittenSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormativeReview" ADD CONSTRAINT "FormativeReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WrittenSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormativeReview" ADD CONSTRAINT "FormativeReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseReviewGrant" ADD CONSTRAINT "CaseReviewGrant_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseReviewGrant" ADD CONSTRAINT "CaseReviewGrant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseReviewGrant" ADD CONSTRAINT "CaseReviewGrant_caseSlug_fkey" FOREIGN KEY ("caseSlug") REFERENCES "CaseScenario"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAudit" ADD CONSTRAINT "LabAudit_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WrittenSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAudit" ADD CONSTRAINT "LabAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceSection" ADD CONSTRAINT "ReferenceSection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseReference" ADD CONSTRAINT "CaseReference_caseSlug_fkey" FOREIGN KEY ("caseSlug") REFERENCES "CaseScenario"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseReference" ADD CONSTRAINT "CaseReference_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceProgress" ADD CONSTRAINT "ReferenceProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceProgress" ADD CONSTRAINT "ReferenceProgress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ReferenceSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve legacy content; only mark the known synthetic seed for demo visibility.
UPDATE "CaseScenario" SET "isDemoSeed" = true WHERE "slug" = 'kerahasiaan-dalam-supervisi';
CREATE UNIQUE INDEX "WrittenSubmission_one_draft" ON "WrittenSubmission"("userId", "caseSlug") WHERE "status" = 'DRAFT';
CREATE UNIQUE INDEX "FormativeReview_one_draft" ON "FormativeReview"("submissionId", "reviewerId") WHERE "status" = 'DRAFT';
