# SI JANI knowledge system — Phase 3

## Scope and provenance

Phase 3 extends the Phase 2 application. No user-provided academic documents, licensed portraits, institutional identity service, or existing approved publication collection were available. The three uploaded text files are development briefs, not academic sources. No private external source or Google Drive was accessed.

The implementation demonstrates a small, interconnected **draft** collection. It does not establish a reviewed psychology curriculum. The seed does not publish or verify sources, prose, relationships, or comparison conclusions.

## Data model

`KnowledgeEntity` provides stable IDs and slugs for DOMAIN, APPROACH, THEORY, CONCEPT, and THEORIST. Using one typed entity table gives every graph edge a real foreign key and lets revisions, citations, and activity apply consistently across content types. `contentSchema` defines optional, bounded plain-text fields and an optional deterministic knowledge check. Missing biographical dates, publications, assumptions, and evidence remain empty.

- `KnowledgeMembership` is a normalized many-to-many connection to the existing `LearningDomain`. Concepts may span domains. The existing `Article` and its learner progress remain unchanged.
- `KnowledgeRelation` has a stable ID, foreign-key endpoints, typed direction, explanation, optional source and locator, verification state, and reviewer metadata. Membership edges and scientific connections are distinguishable. Visual position never implies causation.
- `KnowledgeCitation` links a source to an exact content section or an explicitly reviewed whole article (`all`). Source metadata verification and claim-to-section verification are different decisions.
- `KnowledgeRevision` stores immutable numbered snapshots. `KnowledgeReview` records actions and notes. The editor is recorded on the revision; source reviews have their own audit records.
- `KnowledgeProgress` is scoped by user/entity and keeps viewed, bookmarked, practiced, completed, and reviewed timestamps separately. It stores the latest knowledge-check result with the revision of its key. It is not a mastery score or a complete attempt-history ledger.
- `AcademicSource` retains existing metadata and adds publication, publisher, edition, DOI, ISBN, normalized bibliographic fingerprint, verified date, and review records. Unique identifiers/fingerprints prevent duplicate imports.

Two additive migrations introduce these models, indexes, and EDITOR/REVIEWER roles. They do not drop existing columns, tables, or learner records. A separate relationship flag limits demo visibility to explicit seed drafts. The legacy five-format case and eleven-dimension self-review are outside this content editor.

## Visibility and editorial lifecycle

`DRAFT → UNDER_REVIEW → VERIFIED → PUBLISHED`; correction returns a record to DRAFT. PLANNED is available for incomplete taxonomy/catalog records. Unpublished imports are private to EDITOR/REVIEWER. Ordinary users see published entities and, only when `APP_MODE=demo`, explicitly marked seed drafts/planned entries. Unverified imported relationships are private. The existing six demo articles remain labeled legacy drafts.

STUDENT cannot edit content. DOSEN retains its existing read-only inventory permission and receives no editorial or learner-record access. EDITOR can import/edit drafts and submit them. REVIEWER can also review sources, verify another editor's current revision, publish, revoke approval, and verify relationships. No privileged account is seeded or publicly provisioned; real identity and staff provisioning remain a separate milestone.

Verification requires the required structured fields, domain membership, verified source metadata, and explicit locator mappings for populated fields. The reviewer action attests those mappings. Publishing checks them again. Saving or importing cannot set an approval status. The last editor cannot verify the same revision. Edits require a matching revision number and draft state; slug, ID, and entity type remain stable. Transactions use serializable isolation to reject overlapping editorial writes.

Revoking a source returns dependent knowledge material to draft, clears section verification, invalidates connected relationship reviews, increments revisions, and records the reason. Relation approval requires both endpoints and the cited source to be verified. Deleting content/sources through the application is intentionally unsupported; foreign keys protect references and corrections use revisions.

## Ingestion

The protected `/editorial` workbench accepts structured JSON, with validation in `src/lib/knowledge-model.ts`. See `prisma/import-example.json` for a deliberately unverified draft packet. A packet has `sources`, `entities`, and `relations`; source and entity creation is transactional. Existing IDs, slugs, source fingerprints, DOI/ISBN, or duplicate edges produce a conflict and roll back the packet. Editing is a separate revision-checked operation.

Import a new DOMAIN with ID `domain:<slug>` and `domainSlugs: ["<slug>"]`. Its taxonomy record and knowledge page are created in the same transaction. Put the domain before dependent entities in a packet. Unpublished imported domains remain private, including navigation/filter inventories. Editing its title or summary also updates its taxonomy metadata. Editing an entity preserves the IDs of unchanged domain relationships and invalidates their previous review.

Limits: 64 KB request bodies; up to 25 sources, 25 entities, and 100 relations per import; bounded text fields; existing domain/source/endpoint references required. Source URLs allow HTTP(S) without credentials. Content is rendered as text by React. No HTML rendering, remote URL fetching, code execution, embedded document instructions, PDF/OCR import, or automatic publication occurs.

Seed installation uses create-if-missing semantics. Repeating setup preserves existing editorial changes and learner records. Source titles already present in Phase 1 remain pending; the seed never promotes them.

## Search and navigation

The universal search queries actual titles, summaries, keywords/alternative terms, and source metadata. It is case-insensitive, treats SQL wildcard characters literally, debounces requests by 300 ms, cancels stale responses, highlights literal matches, and provides native keyboard-accessible links. Type/domain filters and pagination are database-backed. The search returns up to 12 entities and 12 sources per page and reports the actual total. It is not semantic/AI search and does not index arbitrary full document bodies.

Structured routes are `/encyclopedia/domain/[slug]`, `/teori/[slug]`, `/konsep/[slug]`, `/tokoh/[slug]`, and `/pendekatan/[slug]` under `/encyclopedia`. Legacy `/encyclopedia/[slug]` URLs and their completion records are retained. Collections currently cap at 100 records; search and personal/editorial histories provide pagination. Increase collection pagination and search indexing before importing a large corpus.

## Knowledge Map

React Flow (`@xyflow/react`) renders stored nodes and typed edges. Users can load/filter a domain, filter node and relationship types, select nodes, inspect summaries and source/status context, open content, zoom, pan, and reset. Nodes have text labels and shape/border differences; draft edges are dashed. Native controls and a complete text alternative allow keyboard navigation without manipulating the canvas. Touch pan/pinch is supported by the library.

Queries are bounded to 80 nodes and 300 edges, with domain scoping and a limit notice. No force-layout randomness or lexical-similarity inference creates relationships. Desktop fits the graph; mobile starts at readable scale and offers explicit pan/zoom and a text alternative. Dense corpus clustering and large-scale graph performance benchmarking are future work.

## Comparison and micro-learning

Comparison reads structured fields from two different published, verified theories with reviewed citations. Unsupported pairs and missing dimensions show incomplete-data states; no comparative narrative is generated. The current seeded theories are drafts, so **no real academically verified comparison is available yet**. Synthetic test fixtures exercise the supported comparison path and are removed afterward.

Reinforcement includes one deterministic reading check, clearly labeled as based on a draft. The answer key stays on the server until an answer is submitted; responses include the key's explanation and persist the result against that revision. An opened page records a visit only after client mounting. Explicit controls separately save a bookmark, record reading completion, or record review. Cross-account access is scoped to the authenticated user.

## Main implementation files

| Area | Files |
| --- | --- |
| Models and safe migrations | `prisma/schema.prisma`, `prisma/migrations/20261020101500_knowledge_system/`, `prisma/migrations/20261020110000_demo_relationship_visibility/` |
| Draft inventory / import example | `prisma/knowledge-seed.ts`, `prisma/seed.ts`, `prisma/import-example.json` |
| Validation, permissions, queries | `src/lib/knowledge-model.ts`, `src/lib/knowledge.ts`, `src/lib/editorial.ts` |
| API | `src/app/api/knowledge/[...path]/route.ts` |
| Reading, search, activity, map | `src/components/knowledge-*.tsx`, `src/components/reading-aside.tsx` |
| Editorial workbench | `src/components/editorial-workbench.tsx`, `src/app/(learn)/editorial/page.tsx` |
| Theme integration | `src/app/knowledge.css`, root layout, existing navigation and progress pages |
| Verification | `tests/unit/knowledge.test.ts`, `tests/e2e/phase-three.spec.ts`, updated original browser selectors |

## Remaining editorial dependencies

The seed contains 12 domain records, three theories (classical conditioning, operant conditioning, working-memory model), three concepts (reinforcement, extinction, working memory), six theorist contexts (Pavlov, Skinner, Baddeley, Hitch, Piaget, Erikson), and five pending source records shared with the preserved six legacy articles. No approach entry or verified biography is asserted. Extinction is a new educational draft; other prose mostly reuses existing draft context.

The additional names/topics in the Phase 3 brief are an editorial backlog. In particular, the supplied name “Albert Bigelow Kelly” needs identity clarification and supporting sources; it is not silently substituted with another psychologist or published as a verified person. Birth/death dates, portraits, primary publications, exact locators, and empirical findings require approved source material and human review.

Institutional sign-in/account recovery, verified staff provisioning, full source-document management, historical knowledge-check attempts, durable partial written assessments, and independent security/assistive-technology review remain outside this phase. See PROJECT_STATUS.md for executed checks, and ROADMAP.md for the next milestone.
