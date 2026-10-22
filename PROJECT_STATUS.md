# SI JANI project status

## Current scope — Phase 4

Blok 1 now has a case-analysis laboratory with server-saved partial writing, versioned cases/rubrics, self-review, scoped instructor feedback, immutable submissions, revisions, and review amendments. The existing Encyclopedia, Knowledge Map, learning gateway, profiles, simulations, legacy reflection, sources, and progress remain in place.

This is an operational local demo with synthetic content. Academic/curricular approval and real institutional use remain blocked by unavailable primary source documents, exact provision mappings, authorized human content/rubric review, and verified identity/staff administration. No AI evaluation service is configured or imitated.

## Audit and continuity

The repository originally began empty. Phase 4 inspected the existing implementation and the uploaded development brief. The baseline had 31 passing unit tests, five server-scored exercise formats with attempt snapshots, a one-record eleven-dimension self-review, and the Phase 3 knowledge system. Written partial drafts were only held in memory; case narrative snapshots, scoped instructor reviews, and a source-section reader were missing. All five source records were pending verification.

At the end of Phase 4, the original authentication, eleven rubric definitions, legacy content seed, knowledge queries, and editorial service remained byte-identical to Phase 3. Preview preparation subsequently adds deployment-specific origin validation and HTTPS cookie handling; the session identity model is preserved. The existing `/analisis` reflection and its records are retained. Case laboratory functionality extends the current case/attempt/source models rather than replacing the application.

One additive migration introduces ten laboratory/review/reference tables, case metadata, and a nullable simulation narrative snapshot. An isolated restore of the Phase 3 backup followed by the Phase 4 migration preserved all original columns across 22 existing tables. Repeating seed installation preserved every row across 25 checked content, learner, and review tables. No table, learner record, or historical score was dropped or rewritten.

## Implemented learning flow

- Blok 1 links to a searchable case library, the original exercises/reflection, source readers, guidance, private writing history, and separate activity counts.
- Two synthetic cases support five interactive formats each. New attempts snapshot case context and scoring policy; answer keys and option explanations stay server-side until submission. Matching, sequencing, and multipart exercises retain keyboard-operable controls and save/resume/retakes.
- The laboratory places case narrative, facts, stakeholders, missing information, evidence, and source links beside an eleven-dimension editor. On small screens, case context becomes a native disclosure above the editor.
- Partial written drafts persist server-side with conflict detection and numbered save snapshots. Submission freezes the answers. Revisions create a linked new analysis without modifying the earlier one.
- The stored provisional rubric preserves eleven equal 1–4 levels. Its configurable calculation supports weights, maxima, score-bearing flags, unassessed states, and policy-controlled non-applicability. Missing ratings never become zero.
- Self-review and instructor review are distinct. Assessed final dimensions require an exact answer excerpt, explanation, and improvement advice. Final feedback includes strengths, opportunities, next steps, linked sources, rubric version, coverage, and an appropriate score or explicit unavailable state.
- Instructor review requires DOSEN and an active reviewer/student/case grant. Student drafts and instructor draft reviews remain private. Review drafts, revision requests, finalization, read/save audit events, and immutable numbered amendments are implemented. No privileged accounts or grants are seeded.
- Four ethics/legal source readers offer document navigation, search, eight orientation sections, jurisdiction/version/status labels, official links, related cases, and explicit reading completion. They do not reconstruct missing source text or legal articles.

## Actual inventory

| Item | Available | Status |
| --- | ---: | --- |
| Ethics cases | 2 | Confidentiality/supervision; BUMD delegation (500 participants, three days, five S1 graduates); synthetic drafts |
| Structured questions | 10 | Two sets of all five formats; educational draft keys/explanations |
| Case versions | 2 | One preserved context version per case |
| Laboratory rubric | 1 version / 11 dimensions | Provisional, equal 1–4 defaults; no institutional approval claimed |
| Ethics/legal source readers | 4 / 8 sections | HIMPSI, UU 23/2022, APA, APS; editorial orientation only |
| Academic source records | 5 | All pending verification |
| Knowledge collection | 12 domains / 3 theories / 3 concepts / 6 theorist contexts | Preserved drafts and planned entries |
| Knowledge relationships/citations | 23 / 12 | Unverified |
| Legacy articles | 6 | Preserved editorial drafts |
| Published knowledge entries | 0 | No verified academic comparison available |

No dates, portraits, primary source passages, article numbers, exact locators, or legal findings were invented. The earlier ambiguous name “Albert Bigelow Kelly” remains an editorial clarification item.

## Scoring and historical integrity

Written feedback uses human/self-selected ratings, not word counts, keywords, or AI inference. The default remains `round(sum(levels) / 44 × 100)`. The general stored policy is `round(100 × sum(weight × points / maximum) / sum(weight))` over score-bearing dimensions. Unassessed dimensions leave the overall score unavailable. Non-applicable exclusions require explicit policy and rationale. Final review records retain their ratings and the submission's copied rubric definition.

New multiple-response snapshots use `penalty-no-all-v2`: the prior correct-minus-incorrect formula, floored at zero, plus zero credit for selecting every option when distractors exist. Historical snapshots retain their earlier `penalty-v1` behavior and stored scores. Sequence alternatives must be explicitly authored. New simulation context is snapshotted; old attempts without a narrative snapshot are labeled as showing current-context fallback.

See CASE_LAB_ARCHITECTURE.md for database changes, permissions, formulas, lifecycle, file map, and operational boundaries.

## Verification — 2026-10-21 (Asia/Jakarta)

- ESLint with zero warnings: passed.
- Strict TypeScript and route generation: passed.
- Unit tests: all 42 passed across five files.
- Production build: passed for 42 routes.
- Phase 4 browser checks: all 12 passed, including instructor review through the UI, draft persistence, revision integrity, permission revocation, and reading/writing/feedback accessibility in both themes at 360, 390, 768, 1024, and 1440px.
- Full production browser regression suite: all 47 passed in 2.8 minutes, with no failures or skipped tests. This includes all 35 existing Phase 1–3 checks and all 12 Phase 4 checks. Tested journeys had no axe violations, horizontal page overflow, or browser errors.
- Isolated backup restoration/migration preservation: passed across 22 pre-existing tables and original columns.
- Repeat seed preservation: passed across 25 checked tables.
- Mobile/desktop light/dark workspace screenshots reviewed. Post-test inventory confirmed two cases, ten questions, eight reference sections, one provisional rubric version, unchanged knowledge counts, and no remaining laboratory test profiles, submissions, reviews, grants, audits, or privileged demo users.
- Private database backup refreshed after test cleanup. Local production health check returned HTTP 200. The Phase 4 source archive was verified against all 141 current source files.

The first browser run exposed unstable exact form labels after restoring textarea/select content, small mobile navigation targets, and an unnecessary scrollable narrative region. Explicit stable labels, 44px wrapping tabs, and the responsive context disclosure addressed them. A reference-reading test now waits for save confirmation before reload; the network-failure test scopes its alert to the editor instead of Next.js's route announcer. No assertions were disabled.

Historical Phase 3 validation passed 31 unit and 35 production-browser checks; Phase 2 passed 25 unit and 24 browser checks. The production dependency audit had zero reported findings on 2026-10-20; Phase 4 adds no dependencies. These historical results are not presented as a new security or accessibility certification.

## Remaining limitations and Phase 5 priorities

- Primary academic/legal documents, reproduction rights, current source versions, exact provision mappings, rubric/anchor approval, and authorized human curricular review remain unavailable. All new source orientations and examples are drafts.
- Institutional sign-in, recovery, NPM verification, staff provisioning, and a trusted interface to grant/revoke instructor scopes are not implemented. Scope enforcement is functional and tested with temporary synthetic grants; no real access was granted.
- No case/rubric version authoring UI, source-document upload, or general source metadata editor is included. Approved new versions require a controlled server-side content task. AI review is absent.
- Anonymous demo accounts cannot be recovered after losing their session. Existing legacy partial reflection remains in memory; durable writing/reviews use the new laboratory. Real data retention/deletion policies remain a prerequisite.
- Laboratory lists paginate by 20; saved-revision UI exposes the latest 50 saves. Full knowledge-check attempt history and larger-corpus pagination/indexing remain planned. The graph retains its 80-node/300-edge limit.
- Cross-browser/load testing, manual assistive-technology review, and independent security review remain outstanding. Automated axe/Chromium checks do not establish full WCAG compliance or psychometric validity.
- Legacy attempts cannot recover unsaved historical narrative versions. No historical answers or scores were rewritten. Blok 2 remains planned.

Recommended Phase 5: verified institutional identity and scoped staff/grant administration, approved primary sources and rubric governance, then a supervised pilot of the two cases and source-reviewed knowledge content. Preserve versioned histories when adding authoring tools.

## Browser preview preparation — 2026-10-22 (Asia/Jakarta)

The existing application was inspected and preserved; no Phase 4 source file was removed. The configured Git destination is `https://github.com/dhinags/SIJANI.git`. The remote initially had no branches or commits. An empty initialization commit on `main` provides a PR base, with the complete application on `codex/sijani-phase4-preview`.

Vercel Preview support accepts only the exact deployment/branch HTTPS origins supplied by Vercel's server environment, alongside any explicit `APP_ORIGIN`. Request host headers never establish trust. Vercel sessions use Secure cookies. `vercel.json` selects Next.js and a preview build that validates demo/database configuration before applying the existing migrations and create-if-missing seed. Production builds do not automatically migrate or seed. No learning features, sources, scoring rules, or historical records were replaced.

Fresh verification:

- Lint, strict TypeScript, and all 46 unit tests passed, including four new origin/cookie tests.
- Production build passed with 42 routes; all five migrations were already applied.
- All 47 production Chromium workflow/accessibility/security tests passed in 2.3 minutes, with no skipped tests.
- Landing `/`, Encyclopedia `/encyclopedia`, Blok 1 `/blok/etik-hukum`, and `/laboratorium` returned HTTP 200. Browser headings and screenshots were checked; `/api/health` returned `{"status":"ok"}`.
- A second production server with Vercel Preview environment settings accepted its deployment and branch origins, issued Secure/HttpOnly cookies, and rejected foreign/missing origins. Its temporary demo profiles were removed. This is local configuration testing, not a hosted Vercel verification.
- Build-script checks confirmed preview command ordering, no automatic production database mutation, rejection of local/missing demo configuration, and immediate termination after a failed migration.

See [VERCEL_PREVIEW.md](VERCEL_PREVIEW.md) for exact deployment, environment-variable, browser-entry, troubleshooting, and safe-transfer instructions. A hosted preview still requires the user's Vercel project and a separate managed PostgreSQL database. The GitHub API returned `Forbidden` from this environment; the prepared comparison/PR instructions are provided as a fallback. No Vercel deployment or real-account administration was performed.

## Handoff and environment

The existing Node/PostgreSQL setup remains applicable: `npm run setup` installs locked dependencies, applies additive migrations, and seeds missing records. No new dependency, secret, network destination, or startup command was required. The stopped local database was restarted through the existing helper; production startup and local functional checks were exercised. Previously saved cloud setup/startup instructions remain applicable. Draft saving, environment publication, and a fresh-task restore are separate; no new publication or fresh-task restoration is claimed.

The original Phase 1–4 source archives are preserved. `/workspace/SIJANI-phase4-source.tar.gz` contains the original 141 Phase 4 source files before preview preparation. The preview handoff branch adds deployment configuration, tests, and instructions; `/workspace/SIJANI-preview-source.tar.gz` and `/workspace/SIJANI-preview.bundle` preserve the prepared source and Git history. Archives exclude credentials, learner records, database dumps, dependencies, and generated builds. Private backups and screenshots remain under ignored `.local/`. Git publishing is authorized by the user's pull request request; Vercel deployment remains a separate action described in the guide.
