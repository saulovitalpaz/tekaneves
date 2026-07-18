# Account Password Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove credential exposure and allow every authenticated user to change only their own password from `/configuracoes`.

**Architecture:** Keep the existing cookie session and Prisma user model. Add one authenticated `PATCH /api/v1/auth/password` route that validates the current password, hashes the new password with the existing bcrypt helper, and updates only the session user's record. Use one shared server page and client form, linked from both internal shells.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, bcryptjs, Zod, node:test.

## Global Constraints

- Clients are created only through autocadastro; the seed must not create new client records.
- Seed credentials must come from `SEED_PASSWORD`; no password may be printed or committed.
- Users may change only their own password; email editing is out of scope.
- The endpoint must reject missing sessions, invalid current passwords, short passwords, and mismatched confirmation.
- Keep the existing response envelope from `lib/api.ts` and the existing session cookie behavior.
- Work directly on `main`; do not create a worktree or run Railway deploy.

---

### Task 1: Remove credential exposure and update seed accounts

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `app/entrar/page.tsx`
- Modify: `lib/dev-access.ts`
- Modify: `docs/superpowers/specs/2026-07-18-account-password-settings-design.md`
- Test: `tests/dev-access.test.ts`

**Interfaces:**
- Produces: Seeded admin `vitoria@tekaneves.psi` and therapist `marilene@tekaneves.psi`, with password supplied only through `SEED_PASSWORD`; no seeded client creation or password logging.

- [ ] **Step 1: Write the failing seed/access tests**

Add assertions that `developmentAccounts` contains the two new internal emails and that `prisma/seed.ts` does not create the client development account or print the seed password.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --import tsx --test tests/dev-access.test.ts`

Expected: FAIL because the old development emails and seed behavior are still present.

- [ ] **Step 3: Update seed and public examples**

Use the new emails, migrate legacy admin/therapist rows by email when present, require `SEED_PASSWORD` from the environment, remove the client upsert, and remove password output. Replace credential-looking values in `.env.example` with placeholders and update README/login copy to describe environment configuration without showing a password.

- [ ] **Step 4: Run focused tests again**

Run: `node --import tsx --test tests/dev-access.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the credential cleanup**

```powershell
git add prisma/seed.ts .env.example README.md app/entrar/page.tsx lib/dev-access.ts tests/dev-access.test.ts docs/superpowers/specs/2026-07-18-account-password-settings-design.md
git commit -m "security: remove exposed seed credentials"
```

### Task 2: Add password validation and authenticated API

**Files:**
- Modify: `lib/validation.ts`
- Create: `app/api/v1/auth/password/route.ts`
- Test: `tests/account-password.test.ts`

**Interfaces:**
- Consumes: `getCurrentUser`, `prisma`, `verifyPassword`, `hashPassword`, `apiData`, and `apiError`.
- Produces: `changePasswordSchema` and `PATCH /api/v1/auth/password` returning `{ data: { ok: true }, error: null }` on success.

- [ ] **Step 1: Write failing validation tests**

Test that a short new password, mismatched confirmation, and valid three-field payload produce the expected Zod result.

- [ ] **Step 2: Run the validation tests to verify they fail**

Run: `node --import tsx --test tests/account-password.test.ts`

Expected: FAIL because `changePasswordSchema` and the new route do not exist.

- [ ] **Step 3: Implement the schema and route**

The route must parse JSON safely, require the current session, validate input, load the current user's hash by `getCurrentUser().id`, compare with bcrypt, hash the new password, and update only that user's `passwordHash`. Never return a hash or log request values.

- [ ] **Step 4: Run the focused tests**

Run: `node --import tsx --test tests/account-password.test.ts`

Expected: validation tests PASS; database-backed route tests may require the configured PostgreSQL database and must report connection failure separately from code assertions.

### Task 3: Add the internal settings page

**Files:**
- Create: `app/configuracoes/page.tsx`
- Create: `components/password-settings-form.tsx`
- Modify: `components/admin-shell.tsx`
- Modify: `components/portal-shell.tsx`
- Modify: `app/globals.css`
- Test: `tests/account-password.test.ts`

**Interfaces:**
- Consumes: authenticated `SafeUser` from `requireUser()` and `PATCH /api/v1/auth/password`.
- Produces: `/configuracoes` with a read-only email display and a form for current password, new password, and confirmation.

- [ ] **Step 1: Add failing page and navigation assertions**

Assert that the shared settings page calls `requireUser`, the form posts to `/api/v1/auth/password`, and both shells link to `/configuracoes`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --import tsx --test tests/account-password.test.ts`

Expected: FAIL because the page, form, and links are missing.

- [ ] **Step 3: Implement the page and form**

Use existing internal page classes, show the user email as non-editable text, provide loading/error/success states, and keep all fields `type="password"` with appropriate autocomplete values. Do not expose the current password or server response details.

- [ ] **Step 4: Run focused UI/source tests**

Run: `node --import tsx --test tests/account-password.test.ts`

Expected: PASS for source and validation assertions.

### Task 4: Security and release verification

**Files:**
- Modify only when verification identifies a concrete issue.

- [ ] **Step 1: Scan tracked files for credential patterns**

Run `git grep` for database URLs, private keys, password literals, password logging, and token logging. Expected: only placeholders and variable names; no real database URL, password, or hash.

- [ ] **Step 2: Run application checks**

Run: `npm test`, `npm run lint`, `npx prisma validate`, `npm run build`, and `git diff --check`.

Expected: tests, TypeScript, Prisma validation, build, and whitespace checks pass. Database tests require a PostgreSQL database and must not use production unless explicitly intended.

- [ ] **Step 3: Review Git state and commit**

Run `git status --short --branch` and confirm only the approved feature files are changed, then commit:

```powershell
git add .
git commit -m "feat: add secure account password settings"
```

- [ ] **Step 4: Hand off Railway without deploying**

Confirm `DATABASE_URL` is the Railway variable name, `SEED_PASSWORD` is configured in Railway, and leave `railway up` for the user to run manually.
