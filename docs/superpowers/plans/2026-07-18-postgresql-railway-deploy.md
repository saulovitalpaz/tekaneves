# PostgreSQL Railway Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate local development and Railway production on PostgreSQL, with a single Next.js service and a repeatable `railway up` deployment.

**Architecture:** The `web` Railway service serves the Next.js browser experience, API route handlers, authentication, Prisma access, and outbound calls to DummyJSON and MyMemory. The linked Railway PostgreSQL service is the only application database in every environment. Local development uses a separate PostgreSQL database and the same migration chain, so local upgrade tests exercise the production provider.

**Tech Stack:** Next.js 15, React 19, Prisma 6, PostgreSQL, Railway CLI 4.x, Node.js scripts, TypeScript.

## Global Constraints

- Keep one application service on Railway; do not split frontend and backend.
- Use PostgreSQL as the Prisma provider in all environments.
- Keep outbound quote and translation requests server-side.
- Keep the one-hour quote cache and manual fallback behavior.
- Do not commit `.env` or production credentials.
- Run Prisma migrations before the production server starts.

---

### Task 1: Record the PostgreSQL deployment decision

**Files:**
- Create: `docs/architecture/adr-001-postgresql-all-environments.md`

**Interfaces:**
- Produces: The documented decision that future changes should preserve one PostgreSQL provider and one application service.

- [ ] **Step 1: Write the decision record**

Document the approved choice, alternatives rejected, local development constraint, Railway service topology, and consequences. State that the Railway database URL must be provided through the linked service variable reference rather than committed to the repository.

- [ ] **Step 2: Review the record for unresolved placeholders**

Read the decision record once after writing it and confirm that it contains no unresolved placeholder text.

- [ ] **Step 3: Commit the decision record**

```powershell
git add docs/architecture/adr-001-postgresql-all-environments.md
git commit -m "docs: record PostgreSQL deployment decision"
```

### Task 2: Switch Prisma and migrations to PostgreSQL

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env.example`
- Modify: `prisma/seed.ts` only if PostgreSQL-specific seed behavior is required after generation
- Delete: `prisma/migrations/20260717015231_init/migration.sql`
- Delete: `prisma/migrations/20260718041058_add_homepage_inquiries/migration.sql`
- Delete: `prisma/migrations/20260718045542_add_primary_therapist/migration.sql`
- Delete: `prisma/migrations/20260718100000_add_appointment_summaries/migration.sql`
- Delete: `prisma/migrations/20260718130000_add_pre_registered_appointments/migration.sql`
- Delete: `prisma/migrations/20260718150000_add_homepage_quote_settings/migration.sql`
- Create: `prisma/migrations/20260718170000_init_postgresql/migration.sql`
- Modify: `prisma/migrations/migration_lock.toml`

**Interfaces:**
- Consumes: The current complete Prisma model set and the empty local development database.
- Produces: A single PostgreSQL migration chain that can be applied by both local development and Railway.

- [ ] **Step 1: Change the datasource provider and local example URL**

Set `provider = "postgresql"` in `prisma/schema.prisma` and use a clearly local PostgreSQL placeholder URL in `.env.example`. Keep `SEED_PASSWORD` as an environment-only placeholder in the example.

- [ ] **Step 2: Generate the PostgreSQL baseline migration**

After the schema change, generate SQL from an empty database state with Prisma's migration tooling. The resulting migration must create every model, index, relation, and default represented in `prisma/schema.prisma` without SQLite `PRAGMA`, `DATETIME`, or `AUTOINCREMENT` syntax.

- [ ] **Step 3: Verify the migration is PostgreSQL-only**

Run: `rg -n "PRAGMA|DATETIME|AUTOINCREMENT|sqlite" prisma/migrations prisma/schema.prisma`

Expected: no matches.

- [ ] **Step 4: Reset the local development database target**

Remove only the tracked local SQLite database file if present, then configure `.env` to use the local PostgreSQL URL. Do not point `.env` at the Railway production database.

- [ ] **Step 5: Commit the database migration**

```powershell
git add prisma .env.example
git commit -m "feat: use PostgreSQL across environments"
```

### Task 3: Make build and start commands Railway-safe

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: `npm run db:generate`, `npm run db:migrate:deploy`, `npm run build`, and `npm run start` behavior compatible with a clean Railway build.

- [ ] **Step 1: Add production migration and generation scripts**

Add a `db:migrate:deploy` script using `prisma migrate deploy` and ensure the build generates Prisma Client before `next build`. Keep `db:migrate` for local PostgreSQL migration development.

- [ ] **Step 2: Make production start apply migrations before Next.js**

Set the production start script to run `prisma migrate deploy` and then `next start`, so a fresh Railway Postgres database receives the committed schema before requests are served.

- [ ] **Step 3: Update local instructions**

Explain that local development requires PostgreSQL, that `.env` is not committed, and that the Railway service should receive `DATABASE_URL` as a reference to the linked Postgres service.

- [ ] **Step 4: Commit the runtime changes**

```powershell
git add package.json README.md
git commit -m "chore: prepare Railway PostgreSQL runtime"
```

### Task 4: Document Railway and external API access

**Files:**
- Create: `docs/deploy/railway.md`

**Interfaces:**
- Produces: Portuguese commands for login, linking, checking variables, applying the Postgres reference, deploying with `railway up`, reading logs, and testing external API connectivity.

- [ ] **Step 1: Document the approved topology**

Show one `web` service plus one linked Postgres service. State that no frontend/backend Root Directory split is needed.

- [ ] **Step 2: Document the Railway commands**

Include these command patterns, with placeholders where service names vary:

```powershell
railway login
railway status
railway variables
railway up
railway logs
```

Explain that `DATABASE_URL` should be configured in the Railway Variables UI as `${{Postgres.DATABASE_URL}}` or the equivalent linked service name, and that the current quote code uses outbound HTTPS to `https://dummyjson.com/quotes/random` and `https://api.mymemory.translated.net/get`.

- [ ] **Step 3: Document post-deploy checks**

Include `railway deployment list`, opening the generated public domain, checking `/`, `/entrar`, `/admin`, and verifying the homepage quote card after enabling it in the admin panel. Do not include secrets or a production URL that is not known yet.

- [ ] **Step 4: Commit the deployment guide**

```powershell
git add docs/deploy/railway.md
git commit -m "docs: add Railway deployment commands"
```

### Task 5: Verify the beta before publishing

**Files:**
- Modify: files only if verification exposes a real issue

**Interfaces:**
- Consumes: The complete PostgreSQL schema, migration chain, build scripts, and deployment guide.
- Produces: Evidence that the repository is ready for the user's authenticated `railway up`.

- [ ] **Step 1: Generate Prisma Client**

Run: `npm run db:generate`

Expected: exit code 0.

- [ ] **Step 2: Apply migrations to a disposable PostgreSQL database**

Use a disposable local PostgreSQL container or the explicitly configured development database, never the Railway production database, and run `npx prisma migrate deploy`.

Expected: the complete migration chain applies with exit code 0.

- [ ] **Step 3: Run application checks**

Run: `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.

Expected: all commands exit 0 with no test failures, TypeScript errors, build errors, or whitespace errors.

- [ ] **Step 4: Review Git state**

Run: `git status --short --branch` and `git log --oneline -5`.

Expected: changes are on `main`, no unrelated artifacts are staged, and the deployment files are committed.

- [ ] **Step 5: Publish only after Railway authentication**

Run from the repository root:

```powershell
railway up
```

Expected: Railway builds the Next.js app, runs the production start command with `prisma migrate deploy`, and reports a successful deployment.
