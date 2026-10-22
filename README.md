# SI JANI — Psikologi UNJANI Encyclopedia

An Indonesian psychology learning application with an encyclopedia, conceptual map, ethics case practice, transparent self-review, and individual learning progress.

**Phase 4 adds the case-analysis laboratory, durable written drafts, versioned formative reviews, and scoped instructor feedback to the local demo. This is not a production service or an approved curriculum.** The original repository was empty. No earlier BEHAVEpedia implementation, official university logo, or JANI character asset was available. The visual identity is a design proposal; the compass/letter J is a neutral guide placeholder.

## Run locally

**Want a browser preview from Codex Web?** Follow [VERCEL_PREVIEW.md](VERCEL_PREVIEW.md) to deploy the preserved Phase 4 application to a Vercel Preview with managed PostgreSQL. The application branch is `codex/sijani-phase4-preview` in `dhinags/SIJANI`.

Prerequisites: Node.js 22.12+ or 24 (tested with 24.19), npm, and a running Docker Engine. Ports 3000 and 54329 must be available.

```bash
cd SIJANI
npm run setup
npm run dev
```

`setup` creates `.env` from `.env.example` only if absent, installs the lockfile, generates Prisma Client, starts PostgreSQL 17, applies the included migrations, and seeds representative content. It is safe to repeat. Docker pulls a pinned official PostgreSQL image with digest verification. The database uses a persistent named volume and listens only on loopback port 54329. Its local trust authentication is for synthetic demo data only.

Use port 3000 in your local browser. For cloud onboarding, validation is performed internally; the onboarding UI does not provide a localhost web preview.

```bash
# Individual preparation commands
npm ci
npm run db:generate
npm run db:start
npm run db:migrate
npm run db:seed

# Build and run the production bundle locally, still in explicit demo mode
npm run build
npm run start
```

Do not run `dev` and `start` on the same port. Stop the process you launched before switching. To stop the local database: `docker stop sijani-postgres`. Starting it again preserves its volume. Never remove its volume to troubleshoot a migration.

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL for Prisma; keep it server-side and out of Git. The example targets the local synthetic-data database. |
| `APP_ORIGIN` | Exact browser origin, including scheme and port, without a trailing slash. Used to reject cross-origin state changes. Default local value: `http://localhost:3000`. Required for production/custom domains; optional on Vercel Preview, which accepts only its server-configured deployment and branch HTTPS URLs. |
| `APP_MODE` | Set explicitly to `demo` for anonymous practice sessions. Missing or different values disable demo sign-in and invalidate access through demo sessions. Institutional sign-in is not yet implemented. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Optional path to an installed Chromium binary. Tests automatically use `/usr/bin/chromium` when present; otherwise install Playwright Chromium. |
| `PLAYWRIGHT_BASE_URL` | Optional test target. Match `APP_ORIGIN`. Tests mutate only synthetic local data; do not target a real deployment. |

The dependency installation needs npm registry access and `binaries.prisma.sh` for verified Prisma engines. Docker uses the official Docker registry. If Chromium is absent, `npx playwright install chromium` requires Playwright's documented download destinations and OS dependencies; preserve TLS and artifact verification.

In this cloud workspace, use `npm_config_cache=/workspace/.cache/npm` if the default home-directory npm cache is not writable.

## Current learning experience

Phase 2's light/dark themes, collapsible desktop sidebar, accessible mobile drawer, breadcrumbs, JANI guidance, learning gateway, and saved Blok 1 practice remain in place. JANI provides deterministic page guidance, not conversational AI. Profile initials and real saved progress remain separate from institutional identification.

Phase 3 adds:

- Twelve domain routes; structured theory, concept, and theorist pages; many-to-many domain membership; source/section citations and explicit missing-data states.
- Debounced universal search over stored content and source metadata, with type/domain filters, literal highlighting, pagination, and keyboard-accessible results. The original six article URLs and their saved completion records still work.
- A React Flow Knowledge Map with stored typed relationships, domain/type/relationship filters, node summaries, zoom/pan/reset, touch controls, and an accessible text alternative.
- Theory comparison based only on published, reviewed fields. The current seed has no verified comparison; unsupported pairs explain the missing evidence.
- Private bookmarks, recently viewed material, review and reading-completion controls, and one deterministic draft reading check. Visits and practice do not imply mastery.
- A protected JSON editorial workbench at `/editorial`, source registration and deduplication, revision-safe editing, independent review, publication, and source revocation. STUDENT and DOSEN cannot publish. No privileged account is seeded or publicly provisioned.

The actual seed contains 12 domains, three theories, three concepts, six theorist contexts, 23 typed relationships, 12 structured citation mappings, the six preserved legacy articles, and five pending source records. All explanatory seed material remains draft. No user-supplied academic source document or licensed portrait was available. Read [KNOWLEDGE_ARCHITECTURE.md](KNOWLEDGE_ARCHITECTURE.md) for model, ingestion, publication rules, content inventory, and limitations; [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) describes shared UI conventions.

The existing Blok 1 case retains five formats, deterministic server scoring, versioned keys, save/resume, retakes, and immutable submitted results. The legacy `/analisis` reflection retains eleven self-review dimensions and its existing records; its unsaved partial work remains in memory. The new `/laboratorium` workspace saves partial written analyses and review drafts to the server. Unsaved changes still require an explicit successful save; no learner responses are stored in localStorage. Losing an anonymous demo session remains unrecoverable.

## Phase 4 case laboratory

- `/laboratorium`: searchable case library with the preserved confidentiality/supervision case and a new synthetic BUMD delegation case (500 participants, three days, five S1 graduates). Both have five-format exercises and eleven-dimension written analysis.
- `/laboratorium/analisis/[id]`: desktop context/editor workspace, compact mobile context disclosure, server-saved partial drafts, immutable submissions, parent-linked revisions, save history, self-review, and instructor feedback.
- `/laboratorium/riwayat`: private submitted/draft/review/revision history. Blok 1 and Progress Belajar include separate writing, submission, self-review, instructor-review, and reference-reading counts.
- `/dosen/review`: submissions within explicit active case grants only. Review drafts, evidence excerpts, references, final feedback, revision requests, audit events, and numbered amendments are supported. No instructor or access grant is seeded.
- `/blok/etik-hukum/referensi/[id]`: four ethics/legal sources, eight searchable editorial orientation sections, official links, jurisdiction/version labels, related cases, and explicit reading completion. Primary documents and exact provisions remain unavailable/unverified.

The default provisional rubric preserves eleven equal 1–4 ratings. Missing ratings never become zero; unsupported non-applicable exclusions are rejected. No AI evaluation service or grading imitation is enabled. New simulation snapshots use the documented select-all-zero policy; historical snapshots retain their earlier scoring behavior. See [CASE_LAB_ARCHITECTURE.md](CASE_LAB_ARCHITECTURE.md) for schema changes, lifecycle, permissions, formulas, versioning, and file map.

## Apply Phase 4 to an existing local checkout

Back up the current database, install locked dependencies, generate Prisma Client, apply additive migrations, and seed missing records:

```bash
npm run db:backup
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
```

`npm run setup` remains the full fresh-environment setup command. Seed operations preserve existing content edits and learner records. Do not run development and production servers on the same port; stop your existing process before switching between `npm run dev` and `npm run start`.

## Sessions and data boundaries

Demo access is **not institutional authentication**. Each browser session gets a separate synthetic profile. An opaque random cookie identifies a server-side session; only a SHA-256 token hash is stored in PostgreSQL. Cookies are HttpOnly, SameSite=Lax, expire after seven days, and are Secure for HTTPS origins. Logout revokes the server session. There is no demo account recovery: logging out, deleting the cookie, or expiration makes that profile inaccessible through the UI.

Never enter real student identities, NPMs, private records, or real clinical cases into demo mode. The app does not collect NPM. It cannot certify enrollment, diagnose users, or establish professional competence. No browser localStorage is used for learner responses. Temporary unsaved work is held only in React memory and cleared on successful logout.

Mutations validate origin and Zod schemas, cap request bodies, enforce ownership, and use a database-backed rate limiter. A database partial unique index prevents duplicate active drafts. Revision checks prevent stale tab writes; submitted attempts cannot be edited. Question snapshots preserve answer keys for historical scoring. New simulation attempts also snapshot case context and scoring policy. Older attempts without narrative snapshots display an explicit fallback to current context. Written analyses refer to immutable application-level case versions and copy their rubric definition.

The lecturer API only returns content and source metadata. Separate EDITOR/REVIEWER roles control the Phase 3 workbench; mutation endpoints enforce origin, role, schema, size limits, and revision checks. Imports do not grant publication status. Source revocation withdraws dependent knowledge material. Case review requires an active, unexpired `CaseReviewGrant` for the DOSEN/student/case combination. Student drafts and instructor draft reviews remain private. These grants do not confer access to unrelated learner records; institutional staff/grant administration is still a prerequisite for real use. Production identity, staff provisioning, email/SSO verification, retention/deletion workflows, and a deployment security review remain prerequisites for real use.

## Architecture

- Next.js 16 App Router and React 19 with strict TypeScript.
- Tailwind CSS 4, custom responsive design tokens, a shadcn-compatible Radix Slot button, and Lucide icons. CSS handles subtle animation; native progress elements provide accessible summaries. React Flow renders the bounded knowledge graph.
- PostgreSQL 17 and Prisma 7.10.1 (PostgreSQL driver adapter) with additive migrations and idempotent seed data.
- Server components for reads, a method-dispatched API route for validated mutations, shared pure scoring functions, and client components only for interactions.
- Source registry and citations remain distinct from article prose. Flexible JSON stores versioned question definitions and structured exercise answers; normalized relations provide user ownership and content taxonomy.

```
src/app/                 Pages, layouts, API route
src/components/          Reusable accessible learning UI
src/lib/                 Sessions, persistence, validation, scoring, rubric
prisma/schema.prisma     Data model
prisma/migrations/       Schema and active-draft constraint
prisma/content.ts        Clearly labeled seed content and server-only answer keys
prisma/knowledge-seed.ts Structured knowledge seed, all unverified
prisma/seed.ts           Create-if-missing content installation
tests/unit/              Scoring, content, and component behavior
tests/e2e/               Learning/security regressions and Phase 2/3 workflow/accessibility checks
scripts/                 Local database lifecycle, setup, snapshot helper
```

## Verification commands

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright starts the development server if one is not running. To test the production bundle, run `npm run start` first, then `npm run test:e2e`. Chromium is selected automatically when installed at `/usr/bin/chromium`. On another machine, install a browser using `npx playwright install chromium` or set the executable variable. Phase 2/3/4 checks cover 360, 390, 768, 1024, and 1440px in light/dark mode, keyboard navigation, network failures, session expiry, draft recovery, search, graph interaction, bookmarks, private activity, editorial authorization, publication, source revocation, durable written drafts, scoped instructor review, review amendments, and reference reading. Tests create synthetic profiles and remove their own fixtures; they never need real credentials. Browser traces/reports may contain synthetic test responses and are ignored by Git.

If a restored development cache produces repeated reloads and missing chunks, stop your development launcher and its child server, confirm they have exited, remove only the generated `.next/dev` directory, and restart `npm run dev`. This resolved the stale-cache issue observed at the Phase 2 audit; source files and database volumes must be preserved.

Read `PROJECT_STATUS.md` for actual completed verification and limits. Automated accessibility checks support, but do not establish, full WCAG 2.2 AA conformance.

## Local snapshots and cloud persistence

Docker processes and volumes are not assumed to survive a replacement cloud machine. Before an environment snapshot, run `npm run db:backup`; it writes a private, Git-ignored `.local/database.sql`. On a fresh local volume, `db:start` restores that retained snapshot. It never restores over an existing volume. Newer data requires a new backup.

Cloud setup and startup instructions are saved separately in the environment draft. The user must review/save settings and publish the environment to snapshot installed files. Draft saving is not publication. Unpublished checkout edits can be lost on replacement, as occurred when this session resumed. A source-only archive is prepared separately for handoff; it excludes credentials, learner records, dependencies, and Git metadata.

## Deployment preparation

The application builds with Next.js and is compatible with a Node-based Vercel deployment and managed PostgreSQL. [VERCEL_PREVIEW.md](VERCEL_PREVIEW.md) provides exact preview deployment steps. No Vercel deployment is performed by this task. `vercel.json` uses `npm run build:vercel`; only the Preview environment with explicit demo configuration applies migrations and installs missing synthetic seed records. Production builds only run `npm run build`; apply production migrations as a controlled release step (`npm run db:migrate`). Do not automatically seed editorial content in production.

Before real deployment: implement and test institutional authentication, verified staff provisioning and per-record grants; replace the local trust database with authenticated managed PostgreSQL; configure HTTPS `APP_ORIGIN`; define retention/deletion and operational backup policies; verify academic sources and publication approvals; perform an independent security/accessibility review. `APP_MODE=demo` must not be mistaken for production authentication.
