-- Only one resumable draft per learner and case, even for concurrent starts.
CREATE UNIQUE INDEX "SimulationAttempt_one_active_draft"
ON "SimulationAttempt" ("userId", "caseSlug") WHERE "status" = 'DRAFT';
