-- CreateEnum
CREATE TYPE "KnowledgeKind" AS ENUM ('DOMAIN', 'APPROACH', 'THEORY', 'CONCEPT', 'THEORIST');

-- CreateEnum
CREATE TYPE "EditorialStatus" AS ENUM ('PLANNED', 'DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RelationshipKind" AS ENUM ('BELONGS_TO_DOMAIN', 'DEVELOPED_BY', 'ASSOCIATED_WITH', 'BUILDS_ON', 'RELATED_TO', 'CONTRASTS_WITH', 'APPLIED_IN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'EDITOR';
ALTER TYPE "Role" ADD VALUE 'REVIEWER';

-- AlterTable
ALTER TABLE "AcademicSource" ADD COLUMN     "doi" TEXT,
ADD COLUMN     "edition" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "publication" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publisher" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KnowledgeEntity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "KnowledgeKind" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "content" JSONB NOT NULL DEFAULT '{}',
    "status" "EditorialStatus" NOT NULL DEFAULT 'DRAFT',
    "isDemoSeed" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "authorLabel" TEXT NOT NULL,
    "lastEditorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeMembership" (
    "entityId" TEXT NOT NULL,
    "domainSlug" TEXT NOT NULL,

    CONSTRAINT "KnowledgeMembership_pkey" PRIMARY KEY ("entityId","domainSlug")
);

-- CreateTable
CREATE TABLE "KnowledgeRelation" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "RelationshipKind" NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceId" TEXT,
    "locator" TEXT NOT NULL DEFAULT '',
    "status" "EditorialStatus" NOT NULL DEFAULT 'DRAFT',
    "verifiedAt" TIMESTAMP(3),
    "reviewerId" TEXT,

    CONSTRAINT "KnowledgeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCitation" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "locator" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KnowledgeCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeRevision" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeReview" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceReview" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeProgress" (
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "bookmarkedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "practicedAt" TIMESTAMP(3),
    "checkRevision" INTEGER,
    "checkCorrect" BOOLEAN,

    CONSTRAINT "KnowledgeProgress_pkey" PRIMARY KEY ("userId","entityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeEntity_slug_key" ON "KnowledgeEntity"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeEntity_kind_status_title_idx" ON "KnowledgeEntity"("kind", "status", "title");

-- CreateIndex
CREATE INDEX "KnowledgeEntity_status_isDemoSeed_idx" ON "KnowledgeEntity"("status", "isDemoSeed");

-- CreateIndex
CREATE INDEX "KnowledgeMembership_domainSlug_idx" ON "KnowledgeMembership"("domainSlug");

-- CreateIndex
CREATE INDEX "KnowledgeRelation_toId_idx" ON "KnowledgeRelation"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeRelation_fromId_toId_type_key" ON "KnowledgeRelation"("fromId", "toId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeCitation_entityId_sourceId_section_key" ON "KnowledgeCitation"("entityId", "sourceId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeRevision_entityId_number_key" ON "KnowledgeRevision"("entityId", "number");

-- CreateIndex
CREATE INDEX "KnowledgeReview_entityId_createdAt_idx" ON "KnowledgeReview"("entityId", "createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeProgress_userId_viewedAt_idx" ON "KnowledgeProgress"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "KnowledgeProgress_userId_bookmarkedAt_idx" ON "KnowledgeProgress"("userId", "bookmarkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSource_doi_key" ON "AcademicSource"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSource_isbn_key" ON "AcademicSource"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSource_fingerprint_key" ON "AcademicSource"("fingerprint");

-- AddForeignKey
ALTER TABLE "KnowledgeMembership" ADD CONSTRAINT "KnowledgeMembership_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeMembership" ADD CONSTRAINT "KnowledgeMembership_domainSlug_fkey" FOREIGN KEY ("domainSlug") REFERENCES "LearningDomain"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCitation" ADD CONSTRAINT "KnowledgeCitation_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCitation" ADD CONSTRAINT "KnowledgeCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRevision" ADD CONSTRAINT "KnowledgeRevision_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRevision" ADD CONSTRAINT "KnowledgeRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeReview" ADD CONSTRAINT "KnowledgeReview_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeReview" ADD CONSTRAINT "KnowledgeReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceReview" ADD CONSTRAINT "SourceReview_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AcademicSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceReview" ADD CONSTRAINT "SourceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeProgress" ADD CONSTRAINT "KnowledgeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeProgress" ADD CONSTRAINT "KnowledgeProgress_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "KnowledgeEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
