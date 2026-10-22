# SI JANI development guidance

Build a credible Indonesian psychology learning platform. The repository began empty; no earlier implementation or official art was recovered. The first milestone is an explicitly labeled local demo, not a production service.

## Architecture and continuity
- Next.js App Router, strict TypeScript, PostgreSQL, Prisma. Server components read data; validated API handlers own mutations. Use the existing isolated checkout; do not create a worktree unless requested.
- Keep answer keys, session handling, and authorization on the server. Scope all learner queries to the authenticated user. Retain attempt snapshots for consistent historical scoring.
- Use reusable accessible components, Indonesian copy, semantic HTML, visible focus, and reduced-motion support. Read DESIGN_SYSTEM.md for theme tokens and shell conventions, and KNOWLEDGE_ARCHITECTURE.md for content permissions, review, and import rules. Use SafeLink for internal navigation so unfinished work receives the shared guard. Keep temporary learner work in memory only; never persist it in localStorage or preference cookies.
- Seed stable IDs with create-if-missing semantics, preserving existing editorial edits and learner records. Keep new imports private until reviewed/published; only explicit seed drafts appear in demo mode. Use serializable editorial transactions and revision checks. Never grant editor/reviewer roles through public profile fields.
- Seed stable IDs idempotently without deleting learner records. Preserve working behavior and user changes.
- Read and maintain README.md, PROJECT_STATUS.md, ROADMAP.md, and CONTENT_STANDARDS.md.

## Case laboratory
- Read CASE_LAB_ARCHITECTURE.md before modifying writing, scoring, review, or case references. Preserve legacy reflection records and historical attempt snapshots. New cases/rubrics receive new versions; never rewrite an old definition to change a historical score.
- Instructor access requires DOSEN plus an active grant for the student and case. Content-editing roles do not grant learner access. Student drafts and instructor draft reviews stay private. Do not seed privileged accounts or access grants.
- Missing ratings are unassessed, never zero. Non-applicable exclusions require stored policy and an explicit reason. Scores derive from stored ratings and rubric values; never infer them from prose length or keywords. Final reviews are amended through a separate record.

## Academic integrity and privacy
- Prioritize official and user-verified sources. Mark source status, jurisdiction, editorial paraphrases, and synthetic cases honestly. Never invent legal sections, quotations, institutional verification, official logos, or clinical claims.
- Demo profiles are anonymous practice identities. NPM never grants access or a role. Do not store real student information or real cases in demo mode.
- Staff authorization is enforced server-side; content access does not grant student-record access. No frontend role assignment.
- Never log credentials, session tokens, learner responses, or personal data. Do not commit .env, database dumps, or private records.
- Written work uses labeled self-review, not word-count or keyword grading. Blok 2 stays planned until approved.
- No production deployment, remote service changes, pushes, or real-account administration without explicit authorization.

## Testing
Run lint, strict type checking, scoring/data unit tests, browser workflow/security tests, and production build. Cover saved drafts, retakes, concurrency, cross-account isolation, staff denial, source status, and mobile navigation. Cover both themes and widths 360, 390, 768, 1024, and 1440px after navigation/design changes. Report actual outcomes and unresolved limitations.

For framework changes, consult the matching guides bundled in `node_modules/next/dist/docs/` and the installed Prisma documentation.
