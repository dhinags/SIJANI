# Open the existing Phase 4 application in a browser

Repository: **https://github.com/dhinags/SIJANI**. Application branch: **`codex/sijani-phase4-preview`**, pull request base: **`main`**. The repository was empty at handoff, so `main` contains only an empty initialization commit; the complete Phase 1–4 application is on the pull request branch. No earlier application files were replaced.

The Codex cloud workspace is not itself a public website. These steps create a Vercel **Preview** with its own HTTPS address, database, and working demo sessions. A Vercel account and a separate managed PostgreSQL database are required. No Vercel deployment or managed database has been created by this task.

## Deploy the preview

1. Create an empty PostgreSQL database for this demo, for example a new Neon project or an isolated database branch. Copy its authenticated connection string with the provider's required TLS options. Use a connection that supports Prisma migrations. Do not use a production database or the loopback URL from `.env.example`. This preview installs the existing migrations and creates the existing synthetic seed content; it does not copy your local learner records.

2. On your computer with Git and Node.js 24 installed, clone the application branch:

   ```bash
   git clone --branch codex/sijani-phase4-preview https://github.com/dhinags/SIJANI.git
   cd SIJANI
   npx vercel@latest login
   npx vercel@latest link
   ```

   In `link`, select your Vercel account/team, create a project named `sijani` (or select your existing SI JANI project), and use the current directory as the project root. The repository's `vercel.json` selects Next.js, `npm ci`, and `npm run build:vercel`. In Vercel **Project → Settings → Build and Deployment**, select **Node.js 24.x**, leave Output Directory at the Next.js default, and enable **Automatically expose System Environment Variables** if it is disabled.

3. Add these **Preview** environment variables using the prompts, which avoid placing credentials in shell history:

   ```bash
   npx vercel@latest env add DATABASE_URL preview
   npx vercel@latest env add APP_MODE preview
   ```

   Paste the managed PostgreSQL connection string for `DATABASE_URL`; enter `demo` for `APP_MODE`. If asked to restrict a variable to a Git branch, leave that blank so it applies to this project's Preview environment. Use a project/database dedicated to this preview.

   Leave `APP_ORIGIN` unset for standard Vercel preview URLs. The server accepts this deployment's `VERCEL_URL` and `VERCEL_BRANCH_URL` over HTTPS and uses Secure session cookies. It does not trust arbitrary request host headers or other Vercel projects. For a custom domain, set `APP_ORIGIN` to its exact HTTPS origin, without a trailing slash, and redeploy. Never prefix any of these variables with `NEXT_PUBLIC_`.

4. Deploy the checked-out application as a preview:

   ```bash
   npx vercel@latest deploy
   ```

   Do **not** add `--prod`. The preview build generates Prisma Client, applies the five existing migrations, installs missing synthetic content without replacing existing records, and builds Next.js. An invalid database/demo configuration stops the build. Production builds do not automatically migrate or seed.

5. When Vercel reports **Ready**, open the HTTPS deployment URL printed by the CLI. If Vercel Authentication protects it, sign in with your Vercel account. Use that same URL for the whole session:

   | URL path | What to check |
   | --- | --- |
   | `/` | SI JANI landing page and navigation |
   | `/encyclopedia` | Browse and search the existing draft knowledge collection |
   | `/blok/etik-hukum` | Blok 1: Kode Etik dan Hukum |
   | `/masuk` | Start a demo session, then complete the practice profile using an alias |
   | `/laboratorium` | Open a synthetic case, save a partial analysis, and reload to confirm persistence |

   Encyclopedia and Blok 1 are readable without signing in. Saving practice requires the demo session. Different deployment hostnames have separate browser cookies; keep using the same preview/branch URL when returning to your saved work.

## Connect GitHub for automatic previews

After the first working preview, open **Vercel Project → Settings → Git → Connect Git Repository**, grant the Vercel GitHub app access to **`dhinags/SIJANI`**, and select that repository. Keep `main` as the production branch. Subsequent pushes to `codex/sijani-phase4-preview` create Preview deployments with the configured Preview variables. If connecting does not deploy the existing commit, use **Deployments → Create Deployment** and select that branch, or run the CLI deployment above.

Do not merge the application merely to obtain a preview. The initialized `main` branch has no application until the PR is merged. Do not promote this demo to production as part of previewing it; production database/identity setup remains a separate release task.

## Troubleshooting

- **Build says preview configuration is missing:** verify `DATABASE_URL` and `APP_MODE=demo` are scoped to Preview, then redeploy. `npm run setup` is for the local Docker environment, not Vercel.
- **Database connection or migration fails:** check the provider's TLS connection string, database availability/network access, and migration-capable credentials. Do not reset the database or delete migration history. Review Vercel build logs without posting credentials.
- **Pages return 503 or Blok 1 content is missing:** check that migration and seed stages completed, that runtime uses the same Preview database, and that `/api/health` returns `{"status":"ok"}`.
- **Sign-in/save returns 403:** use the Ready deployment's HTTPS URL; check system environment variables are exposed. A custom domain needs its exact `APP_ORIGIN`. Environment changes require a new deployment.
- **Demo is disabled:** set Preview `APP_MODE` to exactly `demo` and redeploy.
- **GitHub PR creation:** use the prepared comparison at https://github.com/dhinags/SIJANI/compare/main...codex/sijani-phase4-preview?expand=1 if the Codex/GitHub API cannot create it. Both branches must first be pushed. The full application belongs in this PR; the empty base exists only because GitHub requires a base branch.

## Preserve or transfer the work

The configured destination is already `dhinags/SIJANI`, so no repository transfer is needed. If a future task opens another repository, first commit the working application on a feature branch and create a Git bundle (`git bundle create SIJANI-preserved.bundle --all`). Keep the source archive too; database backups and `.env` remain private and outside Git. Add the correct repository as an additional remote, fetch it, and inspect its branches before pushing the feature branch. Preserve the old remote; do not force-push, reset, or overwrite destination history. If histories differ, integrate on a review branch and resolve conflicts while retaining both versions. Create the PR only against `dhinags/SIJANI`.
