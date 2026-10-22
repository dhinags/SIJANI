# SI JANI case laboratory — Phase 4

## Scope and continuity

Phase 4 extends the existing Blok 1 application. It reuses `CaseScenario`, `SimulationQuestion`, `SimulationAttempt`, the authentication/session boundary, source registry, and the eleven existing rubric IDs and definitions. The legacy `/analisis` self-review and its `RubricAssessment` records remain available. The new laboratory supplies the separate submission/revision lifecycle that the old single-record reflection cannot represent.

The new BUMD scenario is fictional: a psychologist accepts assessment-related work for 500 prospective employees in three days and delegates some activities to five S1 graduates. The scenario separates supplied facts, missing information, stakeholders, evidence, alternatives, and learning objectives. It does not presume that all delegation is unlawful. The earlier confidentiality/supervision case is preserved.

Neither case, source interpretation, rubric anchor, nor numeric threshold is presented as institutionally approved. The four ethics/legal source records remain pending; the eight reader sections are editorial orientation, not reconstructed legal provisions. No AI evaluator, private source access, file uploads, real-account provisioning, or production deployment is included.

## Database changes

The additive `20261021090000_case_laboratory` migration adds case category/difficulty/optional-duration/publication/demo metadata to `CaseScenario` and a nullable narrative snapshot to `SimulationAttempt`. The known legacy synthetic case receives its demo flag. Existing narrative, question keys, attempts, scores, profiles, sources, and Encyclopedia records are not rewritten.

| Model | Purpose |
| --- | --- |
| `CaseVersion` | Case/version composite key, public context JSON, and separate private instructor guide. New versions must be inserted; do not edit an earlier version. |
| `RubricVersion` | Versioned, provisional rubric definition, with per-dimension weights, maxima, anchors, applicability, and score-bearing policy. |
| `WrittenSubmission` | Owner, case/rubric version, copied rubric definition, answers, optimistic revision, submission status, parent analysis, and explicit feedback-reading timestamp. |
| `WrittenRevision` | Immutable application-level save/submission snapshots, numbered within each analysis. |
| `FormativeReview` | Reviewer, method, version/amendment, draft/final state, dimension ratings/evidence/feedback/references, summary, outcome, and stored normalized score. |
| `CaseReviewGrant` | Explicit reviewer/student/case scope, grant provenance, expiry, and revocation. |
| `LabAudit` | Privileged reads and review start/save/finalization events; contains action metadata, not student prose. |
| `ReferenceSection` | Source-linked, ordered sections with independent verification and locator fields. |
| `CaseReference` | Foreign-key case/source mapping, relevant dimension IDs, and applicability note. |
| `ReferenceProgress` | Owner-scoped explicit reading completion for a section. It does not verify the source. |

Foreign keys protect case/rubric/source references. Partial unique indexes permit only one active written draft per owner/case and one review draft per reviewer/submission. Serializable transactions and optimistic revision checks protect concurrent mutations. Seed operations create missing records without overwriting existing rows. No privileged account or review grant is seeded.

## Writing and review lifecycle

Starting a case creates or resumes an owned draft with the current case version and a copied rubric definition. Partial answers can be saved. Each save records a numbered revision; mismatched client revisions return 409 and keep the client's working copy available. Submission requires text in all eleven dimensions, but no word count or keyword rule assesses its quality. Duplicate final submission returns the saved record without another revision. Submitted answers cannot be patched.

`DRAFT → SUBMITTED → UNDER_REVIEW → REVIEWED / REVISION_REQUESTED` describes instructor review. Starting instructor review creates UNDER_REVIEW; finalization sets its explicit outcome. A student self-review has its own draft/final state and does not masquerade as instructor assessment. Reading feedback is recorded only through the student's explicit acknowledgment; final amendments clear that acknowledgment.

Revising an analysis creates a new draft linked to its parent, copying its case/rubric version and answers. The previous analysis remains intact. Retrying the same revision request returns its existing child. A different active case draft is resumed rather than duplicated. Final reviews are immutable through the API; amendments create a new numbered review with `amendsId`, preserving earlier feedback and scores. The history shows each final review and marks amendments.

The workspace stores unsaved work in React memory, with the existing navigation guard. Only a successful response means work is saved. No learner prose is written to localStorage or cookies. Demo-session recovery limitations still apply: losing the anonymous session does not recover the profile.

## Instructor authorization

DOSEN status alone gives no access to student submissions. A read or mutation also requires an active `CaseReviewGrant` matching reviewer, student, and case, with no revocation and an unexpired optional expiry. Student drafts remain private even with a grant. EDITOR/REVIEWER content roles do not confer instructor access. Instructor guides appear only within a permitted review context.

Students see their own self-review drafts and final feedback, never an instructor's unfinished review. Review drafts are editable only by their author. The server determines review method, ownership, scores, and transitions; frontend-injected ownership/method/score fields are rejected. Grant validity is rechecked inside review transactions. Student revision snapshots are owner-only; permitted instructors can inspect submitted analysis history through their queue.

Verified institutional identity, staff provisioning, and an audited operator interface to issue/revoke these grants remain prerequisites for real use. The database schema supports those grants now; tests create explicit synthetic grants and remove them. The application offers no public role selector or student-access grant endpoint. No real staff or student access was granted during development.

## Scoring policies and evidence

The established rubric's eleven equal 1–4 ratings remain the default: `round(sum(levels) / 44 × 100)`. The new stored definition makes the general calculation explicit:

`round(100 × sum(weight × points / maximum) / sum(weight))`

For the four supported performance levels, `points = maximum × level / 4`. Only designated score-bearing dimensions with positive weights enter the calculation. An unassessed or absent score-bearing dimension makes the overall score unavailable; it is never treated as zero. Non-applicable is permitted only when the stored dimension policy allows it and the reviewer records a reason; its weight is excluded. An empty denominator also produces no overall score. The default provisional rubric does not allow non-applicable exclusions.

Rated dimensions in a final review require an exact excerpt from that dimension's submitted answer, an explanation, and an improvement suggestion. References must belong to the case. Excerpt matching only checks traceability; it does not infer meaning or validate the rating. Human/self-selected ratings supply the judgment. A partial review may be finalized with explicit unassessed dimensions and no overall score. Summaries, strengths, improvements, and next steps remain required. Historical reviews use the submission's copied rubric definition, so later configuration changes do not reinterpret their scores.

All five simulation formats use the existing shared validator and server scorer. Single answers use the designated key; matching and multipart questions receive the fraction of correct subparts; sequences accept only the authored key or explicitly configured valid alternative sequences. A pedagogical sequence is not a universal ethical decision procedure.

Multiple-response snapshots now identify `penalty-no-all-v2`: `(correct selected − incorrect selected) / total correct`, floored at zero, with zero credit for selecting every option when distractors exist. Historical snapshots without this field retain the prior `penalty-v1` formula, including their historical select-all partial credit. Existing scores and keys are unchanged. Questions remain equally weighted; aggregate raw fractions and round once. Draft data excludes keys, valid answer sequences, and option explanations. Explanations and individual subpart feedback appear after submission.

New simulation attempts snapshot narrative/title/description/version/source IDs as well as question definitions and scoring policy. Older attempts without narrative snapshots display an explicit current-context fallback; earlier narrative versions cannot be reconstructed with certainty.

## Interfaces and file map

| Area | Main files/routes |
| --- | --- |
| Models and migration | `prisma/schema.prisma`, `prisma/migrations/20261021090000_case_laboratory/` |
| Cases, questions, rubric and reference orientation | `prisma/lab-seed.ts`, `src/lib/lab-model.ts`, unchanged legacy `src/lib/rubric.ts` |
| Authorization, transactions, queries | `src/lib/lab.ts`, `src/app/api/lab/[...path]/route.ts` |
| Simulation snapshots/policies | `src/lib/attempts.ts`, `src/lib/scoring.ts`, `src/lib/simulation-policies.ts`, existing attempt API and simulation component |
| Case library and history | `/laboratorium`, `/laboratorium/kasus/[slug]`, `/laboratorium/riwayat` |
| Writing and review | `/laboratorium/analisis/[id]`, `src/components/lab-workspace.tsx` |
| Instructor queue | `/dosen/review` |
| Reference reader | `/blok/etik-hukum/referensi/[id]` |
| Shared context, actions, progress and design | `src/components/lab-*.tsx`, `src/app/lab.css` |
| Regression checks | `tests/unit/lab.test.ts`, `tests/e2e/phase-four.spec.ts`, all existing tests |

Case search, history, and instructor queue use 20-record pages. Saved-revision UI shows the latest 50 saves; older snapshots remain stored. Request bodies are capped at 64 KB; each written dimension is capped at 3,000 characters. There is no source-document upload or case/rubric authoring UI. Approved new content/version installation remains a controlled server-side task.

## Operational limits and next work

The implementation runs locally with synthetic accounts and content. It is not a reviewed curriculum, psychometric instrument, licensing assessment, or professional/legal advice service. Primary source text, reproduction rights, exact provision mappings, rubric approval, institutional identity, staff/grant administration, retention rules, and independent accessibility/security review remain outstanding. AI review is absent, with no misleading grading button.

Prioritize Phase 5 around these source, identity, and governance prerequisites before expanding the case collection. Then add approved case/reference authoring, version release tools, richer history navigation, supervised pilot feedback, cross-browser/manual assistive-technology checks, and operational backup/load testing.
