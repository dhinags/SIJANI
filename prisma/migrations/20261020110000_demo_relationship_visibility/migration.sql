-- Only explicitly marked seed relationships may appear as drafts in demo mode.
ALTER TABLE "KnowledgeRelation" ADD COLUMN "isDemoSeed" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "KnowledgeRelation_status_isDemoSeed_idx" ON "KnowledgeRelation"("status", "isDemoSeed");
