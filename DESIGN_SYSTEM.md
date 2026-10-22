# SI JANI design system — Phases 2–4

## Identity and foundations

The interface uses an academic navy, blue, restrained gold, spacious surfaces, local Inter, and Lucide icons. The brain mark and compass are design proposals, not official university or JANI artwork. No identity assets were supplied in this phase.

`src/app/design-tokens.css` is the shared token source. `globals.css` retains the established page and exercise layouts while replacing repeated hardcoded light surfaces, text, borders, and focus colors with semantic tokens. `experience.css` defines the refined shell, gateway, module dashboard, reading collections, and feedback components.

| Tokens | Purpose |
| --- | --- |
| `--canvas`, `--surface`, `--surface-soft` | Page, card, and supporting backgrounds |
| `--ink`, `--heading`, `--muted` | Body text, headings, supporting text |
| `--navy`, `--navy-deep`, `--gold` | Stable identity and emphasis |
| `--line`, `--control-line`, `--focus` | Separators, input boundaries, keyboard focus |
| `--accent-bg`, `--accent-ink` | Active navigation, badges, and avatars |
| `--notice-bg`, `--notice-ink`, `--success`, `--danger` | Source notices and action feedback |
| `--font-sans`, `--text-small`, `--text-body`, `--text-title` | Typography scale |
| `--space-1` through `--space-12` | Reusable spacing scale |
| `--radius-control`, `--radius-card`, `--radius-dialog` | Corner treatments |
| `--shadow-card`, `--shadow-popover` | Subtle elevation |
| `--motion-fast`, `--motion-page`, `--ease-standard` | Control and route transitions |
| `--sidebar-width`, `--control-size` | Shell dimensions and 44px controls |

Light and dark modes use the same semantic roles. A non-sensitive `sijani_theme` preference cookie is read by the root server layout, so the selected theme is present in the initial HTML. This makes the themed root request-rendered. The toggle updates the document immediately; no new dependency or external font request was added. Light is the initial default; automatic system-theme selection is not implemented.

## Responsive layout

Tailwind breakpoint tokens are `sm: 40rem` (640px), `lg: 64rem` (1024px), and `xl: 75rem` (1200px). The custom shell media queries mirror those literal values because CSS custom properties cannot be used directly in media conditions. Existing content-specific refinements at 430px, 760px, and 980px remain in the base stylesheet.

- Below 1024px: compact header and native modal navigation drawer; breadcrumbs move to a separate wrapping row.
- From 1024px: a 240px sidebar can collapse to 84px. Icons retain accessible labels and titles. The preference uses a non-sensitive `sijani_sidebar` cookie.
- Below 640px: gateway, module cards, and theorist cards become a single column; navigation and form controls remain large enough to operate independently.
- At intermediate widths: cards adapt to available space rather than shrinking all desktop content.

The required validation widths are 360, 390, 768, 1024, and 1440px. Search chips may scroll within their own container; the page itself must not overflow horizontally.

## Navigation and reading

`AppShell` owns navigation, active states, breadcrumbs, the profile disclosure, theme controls, and JANI guidance. Native dialog behavior provides modal semantics and background inertness; explicit first/last focus wrapping, Escape handling, route-close behavior, and focus return complete the drawer interaction. The profile disclosure supports keyboard activation, Escape, and outside-pointer dismissal.

JANI lives in the header so its closed control does not cover learning content. Its optional panel contains short deterministic guidance for the current route, with a real next-step link. It is labeled as fixed guidance, not conversational AI. On small screens, the control uses an accessible compass icon.

`LearningGateway` is shared by `/beranda` and `/tujuan`. Its reading history means articles explicitly marked as learned, not a fabricated browsing log. Practice progress counts the two activities currently persisted: a submitted structured attempt and a completed self-review. It does not claim to measure curriculum completion or competence.

`ArticleCard`, `ArticleSections`, and `CitationList` support consistent article reading. Search/domain context is carried into article links and normalized to a local encyclopedia return path. Theory and theorist indexes reuse existing stored articles; theorist details reproduce their relevant editorial context and citation status, without inventing biographies or new sources.

## Interaction and persistence

Use `SafeLink` for internal navigation. It checks the shared unsaved-work guard through Next.js `onNavigate`; same-document anchors remain usable. Refresh/close triggers the browser's unsaved-work warning when supported. React memory retains unsaved simulation answers and partial written self-reviews during navigation/history within the same tab. It is not durable storage, does not survive a confirmed reload or closed tab, and is cleared on successful logout. Learner answers are never stored in cookies or localStorage.

Only a successful API response produces a saved state. Network failures, malformed service responses, expired sessions, validation errors, and revision conflicts keep entered work available and show explicit feedback. Expired-session feedback links to sign-in and warns that a new demo profile does not recover the prior one. Submitted attempt reviews always use the server's immutable answers, even when an older in-memory edit exists.

Shared `ActionError` and existing live status regions communicate failures and successful persistence. Buttons are disabled while requests are pending. Logout explains the irreversible loss of access to an anonymous demo profile before revoking its session.

## Motion and accessibility

Motion is limited to short page/drawer entrances, hover feedback, and loading skeletons. `prefers-reduced-motion` removes entrances and skeleton pulsing and disables smooth scrolling. No animated background, animation library, or chatbot was introduced.

Use semantic headings, landmarks, real links, explicit labels, visible focus, native progress, and source-status text. A badge color alone never establishes verification. Automated axe checks and Chromium keyboard tests support the review; they do not replace manual assistive-technology evaluation or establish full WCAG conformance. Actual results are recorded in `PROJECT_STATUS.md`.

## Phase 3 knowledge surfaces

`knowledge.css` extends the same semantic tokens for structured entity cards, search results, source mappings, comparison rows, reading activity, the graph, and the protected editorial workbench. Domain/theory/concept/theorist labels and status text accompany visual treatments; gold is restrained. No new university logo, portrait, or character artwork was generated.

Universal search highlights literal query text using React text nodes and `<mark>`, debounces requests, and presents native links. Search is distinct from the preserved legacy article archive. Collections and comparison cells become a single readable column on small screens; selected filter values remain visible. The article sidebar becomes a disclosure at 760px and below so it does not delay the reading content.

React Flow uses explicit typed nodes and stored edges, without force-layout motion. Domain nodes have rounded borders; concept borders are dashed; theorist borders are doubled; all also have written labels. Draft edges are dashed and their explanations/status are available in the context and text views. Edge labels appear for a selected relationship so overlapping labels do not obscure the graph. Desktop fits the available graph; mobile starts at a readable scale with explicit pan/zoom controls and a complete text alternative. These are navigation relationships, not inferred causation. Node, edge, and search-result limits are documented in KNOWLEDGE_ARCHITECTURE.md.

Reading activity distinguishes viewed, bookmarked, practiced, completed, and reviewed. The knowledge-check response states that it follows a deterministic key; draft-based practice is labeled. Editorial screens expose structured JSON because maintainers use it to inspect/import academic content; student flows do not expose implementation details.

## Phase 4 reasoning workspace

`lab.css` uses the existing tokens for the case library, writing/review forms, reference reader, and progress summaries. Desktop places case context beside a spacious editor. Below 1000px, a native context disclosure keeps narrative, evidence, and source links available without placing the whole case before the editor. The public case-detail page retains the full reading context.

Dimension navigation offers keyboard buttons and explicit previous/next controls. Text inputs have stable accessible names after server-rendered draft restoration. Save, submit, self-review, instructor review, revision, and feedback-reading states are separate. Final feedback emphasizes evidence, explanation, and next steps; unavailable scores are labeled explicitly. Review guidance remains in disclosures beside the work. Source links open a labeled new tab when consulted from context, preserving the writing surface.

Laboratory and document tabs have 44px targets and wrap on narrow screens. Both themes and all five required viewport widths are checked; reference/analysis histories remain paginated. The old `/analisis` UI is retained for its earlier records and links to the durable laboratory workflow.
