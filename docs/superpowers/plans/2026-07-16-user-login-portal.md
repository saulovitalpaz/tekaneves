# User Login Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local authenticated client and admin portal with Prisma SQLite, appointment scheduling and asynchronous contact while preserving the public homepage.

**Architecture:** Keep the existing Next.js App Router application and add a Prisma data layer, same-origin REST route handlers under `/api/v1`, and server-side session checks. The portal uses role-aware server components and small client forms for mutations. SQLite is the local adapter and the schema is kept portable for a future PostgreSQL migration.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, SQLite, bcryptjs, Zod, Tailwind CSS and Lucide React.

## Global Constraints

- Development remains local at `http://localhost:3000`.
- Use SQLite local with Prisma; no external auth, database, email, payment, video or realtime service.
- Roles are exactly `ADMIN`, `THERAPIST` and `CLIENT`.
- Contact is asynchronous and focused on appointment requests, not continuous session chat.
- The public homepage and its existing visual language remain intact.
- Client data must be scoped by authenticated user; admin mutations require server-side role checks.
- Passwords are hashed and sessions use expiring `httpOnly` cookies.

---

### Task 1: Add the local data layer

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`
- Create: `lib/validation.ts`
- Modify: `README.md`

**Interfaces:**
- `prisma` exposes `User`, `Session`, `TherapistProfile`, `Availability`, `AppointmentRequest`, `Appointment` and `ContactMessage`.
- `lib/db.ts` exports a singleton `prisma` client.
- `lib/validation.ts` exports schemas for registration, login, availability, appointment requests and contact messages.

- [ ] **Step 1: Add dependencies and scripts**

Add `@prisma/client`, `prisma`, `bcryptjs`, `zod`, `tsx` and `@types/bcryptjs`. Add scripts `db:generate`, `db:migrate`, `db:seed` and `db:studio`.

- [ ] **Step 2: Define the schema and indexes**

Use string IDs, unique email and session token hashes, enum roles and statuses, relations for client and therapist ownership, and indexes for session expiry, therapist agenda and client request history.

- [ ] **Step 3: Add the Prisma singleton**

Use one global client in development to avoid creating a new connection during hot reload, and export the typed client as `prisma`.

- [ ] **Step 4: Add validation schemas**

Reject malformed emails, passwords shorter than 8 characters, empty messages, invalid ISO dates, negative durations and availability ranges where end precedes start.

- [ ] **Step 5: Add a development seed**

Create one admin user, one therapist user with profile and one client user using deterministic local credentials documented in `.env.example` or README as development-only values. Do not seed production credentials.

- [ ] **Step 6: Run the first migration**

Run `npm install`, `npm run db:generate`, `npm run db:migrate -- --name init`, and `npm run db:seed`. Expected result: a local SQLite database with the seed records and no TypeScript errors.

### Task 2: Implement authentication and protected access

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `app/api/v1/auth/register/route.ts`
- Create: `app/api/v1/auth/login/route.ts`
- Create: `app/api/v1/auth/logout/route.ts`
- Create: `app/api/v1/auth/session/route.ts`
- Create: `middleware.ts`
- Create: `app/entrar/page.tsx`
- Create: `app/cadastro/page.tsx`
- Create: `components/auth-form.tsx`

**Interfaces:**
- `hashPassword(password: string): Promise<string>` and `verifyPassword(password: string, hash: string): Promise<boolean>`.
- `createSession(userId: string): Promise<string>`, `getCurrentUser(): Promise<User | null>` and `destroySession(): Promise<void>`.
- API responses use `{ data, error }` with status `200`, `201`, `400`, `401` or `409` as appropriate.

- [ ] **Step 1: Implement password helpers**

Hash passwords with bcryptjs and never return password hashes from route responses.

- [ ] **Step 2: Implement session helpers**

Generate a cryptographically random token, store only its hash, set an expiring `httpOnly` cookie named `teka_session`, and delete the database session during logout.

- [ ] **Step 3: Implement auth route handlers**

Register a client, reject duplicate email, authenticate with a generic invalid-credentials error, return the safe user shape and invalidate the session on logout.

- [ ] **Step 4: Protect portal and admin paths**

Redirect unauthenticated `/portal` and `/admin` requests to `/entrar`; reject unauthorized role access in server-side route logic as well as middleware.

- [ ] **Step 5: Build login and registration screens**

Match the existing cream, navy and serif visual language, show field errors without losing input, include accessible labels and link between login and registration.

- [ ] **Step 6: Verify auth flows**

Run the dev server and use HTTP requests to verify registration, login, session lookup, protected redirect and logout. Confirm a client cannot access `/admin`.

### Task 3: Build the client portal shell and appointment request flow

**Files:**
- Create: `components/portal-shell.tsx`
- Create: `components/portal-nav.tsx`
- Create: `app/portal/layout.tsx`
- Create: `app/portal/page.tsx`
- Create: `app/portal/agendar/page.tsx`
- Create: `app/portal/consultas/page.tsx`
- Create: `app/api/v1/availability/route.ts`
- Create: `app/api/v1/appointment-requests/route.ts`
- Create: `app/api/v1/appointments/route.ts`
- Create: `components/appointment-request-form.tsx`

**Interfaces:**
- `GET /api/v1/availability` returns active future availability slots visible to clients.
- `POST /api/v1/appointment-requests` accepts `{ therapistId, desiredStart, durationMinutes, message }` and returns a pending request.
- `GET /api/v1/appointments` returns only the current client’s requests and confirmed appointments.

- [ ] **Step 1: Build the authenticated shell**

Create the navy top navigation and cream content frame inspired by the dashboard reference, with links to overview, agendar, consultas and contato plus logout.

- [ ] **Step 2: Build the client overview**

Show counts for pending requests and confirmed consultations, the next appointment empty state, and a clear primary path to request a consultation.

- [ ] **Step 3: Implement availability retrieval**

Return only active slots generated from therapist availability, exclude past times and prevent overlapping confirmed appointments.

- [ ] **Step 4: Implement the request form**

Allow selecting a therapist, date, available time and short message. Validate server-side and show pending, success and unavailable-slot states.

- [ ] **Step 5: Build consultation history**

List the client’s pending, confirmed, declined and completed items with dates, therapist and status labels. Show a useful empty state when no sessions exist.

### Task 4: Build admin agenda and decision workflow

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/agenda/page.tsx`
- Create: `app/admin/clientes/page.tsx`
- Create: `components/admin-shell.tsx`
- Create: `components/availability-form.tsx`
- Create: `components/appointment-decision-form.tsx`
- Create: `app/api/v1/appointment-requests/[id]/route.ts`
- Create: `app/api/v1/availability/admin/route.ts`

**Interfaces:**
- `GET /api/v1/appointment-requests` is admin-only and returns filterable requests.
- `PATCH /api/v1/appointment-requests/:id` accepts `{ status, confirmedStart, adminNote }` and enforces admin ownership rules.
- `POST /api/v1/availability/admin` creates or updates availability for the current therapist/admin.

- [ ] **Step 1: Add admin role guard**

Create a shared server-side assertion that returns a safe unauthorized response and use it in every admin page and mutation.

- [ ] **Step 2: Build the admin dashboard**

Show pending requests, today’s confirmed consultations and unread contact messages using the same visual language as the reference dashboard.

- [ ] **Step 3: Build the agenda page**

Render a week-oriented agenda, availability controls and request list. Keep date and status filters explicit and readable.

- [ ] **Step 4: Implement approve, decline and propose-new-time actions**

Confirming a request creates an appointment only after checking conflicts. Declining records an admin note. Proposing a new time updates the request without exposing private admin notes to unrelated clients.

- [ ] **Step 5: Build the client list**

Display only the minimum client information needed for scheduling and show each client’s request and appointment counts.

### Task 5: Add asynchronous appointment-focused contact

**Files:**
- Create: `app/portal/contato/page.tsx`
- Create: `app/admin/mensagens/page.tsx`
- Create: `components/contact-request-form.tsx`
- Create: `components/message-list.tsx`
- Create: `app/api/v1/contact-messages/route.ts`
- Modify: `app/portal/layout.tsx`
- Modify: `app/admin/layout.tsx`

**Interfaces:**
- `GET /api/v1/contact-messages` returns messages visible to the authenticated user.
- `POST /api/v1/contact-messages` accepts `{ appointmentRequestId?, appointmentId?, subject, body }`.
- Admin responses use the same endpoint with a validated recipient and preserve the asynchronous message model.

- [ ] **Step 1: Build the client contact page**

Guide the client to choose an existing request or appointment, write a short message and see previous updates. Do not include typing indicators or realtime presence.

- [ ] **Step 2: Build the admin message inbox**

List unread and recent messages, show the linked consultation context and allow a concise response.

- [ ] **Step 3: Enforce message ownership**

Scope client reads to their own messages and admin reads to messages addressed to their account or managed therapist profile.

- [ ] **Step 4: Verify empty, success and error states**

Cover no messages, invalid message, unauthorized access, successful send and read status update.

### Task 6: Verify and document the worktree

**Files:**
- Modify: `README.md`
- Modify: `.env.example`

**Interfaces:**
- Documents local setup, database commands, seed credentials and route map without promising production readiness.

- [ ] **Step 1: Run type checking and build**

Run `npm run lint` and `npm run build` after stopping the dev server so `.next` is not modified concurrently.

- [ ] **Step 2: Run database verification**

Run `npm run db:migrate`, `npm run db:seed` and `npm run db:studio` as needed. Confirm the schema and seed are reproducible.

- [ ] **Step 3: Run localhost smoke checks**

Verify HTTP 200 for public homepage and auth pages, protected redirects for portal/admin, and successful request creation using the local seeded accounts.

- [ ] **Step 4: Review the worktree diff**

Run `git status`, inspect the route and schema changes, and commit the completed feature as `feat: add local login and appointment portal`.
