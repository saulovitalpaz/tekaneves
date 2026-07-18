# Homepage Entry, Contact and Auth Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the public homepage around a photo-led “Sobre mim” entry, remove the theme cards, preserve the contact conversion path, and bring login/portal surfaces into the same brand system while keeping the appointment workflow unchanged.

**Architecture:** Reuse the existing App Router composition and content module. Move the existing image-led `AboutSection` to the first homepage position and promote its title to the page `h1`; simplify `SupportSection` to an editorial text block; keep the existing contact form and portal APIs untouched. Centralize visual changes in the existing global tokens and add a development-only login help panel that documents the already-seeded local roles without exposing a production credential surface.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React, Prisma SQLite, Node test runner through `tsx`.

## Global Constraints

- All visible public copy remains in Brazilian Portuguese.
- Keep the marfim, verde profundo, dourado suave and serif/sans typography system already in `app/globals.css`.
- Do not change authentication, Prisma models, appointment APIs, availability saving, or appointment decision rules.
- Remove the homepage cards for “Ansiedade”, “Exaustão” and “Relacionamentos”.
- The entry CTA, header CTA and floating contact button all target `#contato`.
- Development account help must not render when `NODE_ENV === "production"`.
- Preserve semantic headings, descriptive image alt text, visible focus, responsive behavior and reduced-motion support.
- Verify with `npm test`, `npm run lint`, `npm run build`, and a local visual pass at desktop and mobile widths.

---

### Task 1: Add regression coverage for the approved content structure

**Files:**
- Create: `tests/homepage-content.test.ts`
- Read: `lib/content.ts`

**Interfaces:**
- Consumes: `siteContent` from `@/lib/content` through the existing TypeScript test runtime.
- Produces: tests that fail if the navigation loses the contact route, if the entry copy disappears, or if the removed support card data is still presented as homepage content.

- [ ] **Step 1: Write the failing content-structure tests**

Create tests that assert the approved public navigation and entry copy, and assert that support content exposes only the editorial title/description after the refactor:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { siteContent } from "@/lib/content";

test("homepage navigation keeps the public journey anchors", () => {
  assert.deepEqual(
    siteContent.navigation.map((item) => item.href),
    ["#acompanhamento", "#para-quem", "#sobre", "#contato"],
  );
});

test("homepage entry uses the approved about copy and contact CTA", () => {
  assert.equal(siteContent.about.eyebrow, "Sobre mim");
  assert.equal(siteContent.about.title, "Escuta atenta, cuidado e respeito pelo seu tempo.");
  assert.equal(siteContent.about.paragraphs.length, 2);
  assert.equal(siteContent.about.ctaHref, "#contato");
});

test("support content no longer defines a homepage card grid", () => {
  assert.equal("areas" in siteContent.support, false);
});
```

- [ ] **Step 2: Run the focused tests and confirm the expected failure**

Run: `npm test -- tests/homepage-content.test.ts`

Expected: FAIL because `about.ctaHref` is not yet defined and `support.areas` still exists.

- [ ] **Step 3: Keep the test file limited to stable content contracts**

Do not add assertions for CSS class names, exact spacing, or implementation-specific component markup; those are covered by lint/build and the visual verification task.

---

### Task 2: Recompose the homepage around the photo-led entry

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/site-header.tsx`
- Modify: `components/about-section.tsx`
- Modify: `components/support-section.tsx`
- Modify: `components/contact-section.tsx`
- Modify: `lib/content.ts`
- Modify: `app/globals.css`
- Remove from the homepage composition: `components/hero-section.tsx` usage and the `DailyPhraseRotator` usage

**Interfaces:**
- Consumes: `siteContent.about`, `siteContent.support`, `siteContent.contact` and `siteContent.navigation`.
- Produces: a homepage ordered as `entry → acompanhamento → para-quem → contato → footer`, with all public links resolving to existing IDs.

- [ ] **Step 1: Update the content contract before the components**

In `lib/content.ts`:

```ts
about: {
  eyebrow: "Sobre mim",
  title: "Escuta atenta, cuidado e respeito pelo seu tempo.",
  paragraphs: [
    "Meu trabalho parte da construção de um espaço seguro, onde sua experiência possa ser acolhida sem pressa e sem julgamentos.",
    "A terapia é um processo singular. Juntos, podemos compreender padrões, nomear sentimentos e encontrar novas possibilidades para a sua vida.",
  ],
  ctaLabel: "Vamos conversar",
  ctaHref: "#contato",
  imageAlt: "Retrato de Teka Neves usando uma camisa azul e óculos claros.",
},
support: {
  eyebrow: "Acompanhamento",
  title: "Cuidar de si também pode ser uma forma de seguir em frente.",
  description:
    "A psicoterapia oferece tempo e espaço para olhar para a sua história com mais gentileza, clareza e curiosidade.",
},
```

Keep the existing `audience`, `contact`, footer and navigation copy unless a wording change is required to keep the new CTA path clear.

- [ ] **Step 2: Make the about section the first semantic entry**

Update `AboutSection` so its section is `id="sobre"`, its title is an `h1` with `id="about-title"`, and its content includes:

```tsx
<p className="eyebrow">{content.eyebrow}</p>
<h1 id="about-title" className="display-font section-heading">{content.title}</h1>
{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
<a className="button-primary" href={content.ctaHref}>{content.ctaLabel}<span aria-hidden="true">↗</span></a>
```

Keep the profile image as the left visual column with the existing descriptive `alt` and responsive `next/image` sizing.

- [ ] **Step 3: Remove the old hero and duplicate about position from page composition**

In `app/page.tsx`, render `AboutSection` first inside `main`; do not render `HeroSection`. Keep `SupportSection`, the audience section, `ContactSection`, `SiteFooter` and `FloatingContactButton` in the approved order. Remove `dailyPhrases` from the page composition.

- [ ] **Step 4: Simplify support to one editorial block**

Remove the icon array and card map from `components/support-section.tsx`. Render only the eyebrow, heading and description inside a calm layout. The component must not render an element with `support-item`, `support-list`, or an article per support theme.

- [ ] **Step 5: Add the header contact CTA without breaking navigation**

In `components/site-header.tsx`, keep the existing public anchors and add:

```tsx
<a className="button-primary site-header-cta" href="#contato">Falar comigo</a>
```

Use `#sobre` for the brand return link so the first visible entry is also the brand destination. Keep the desktop navigation on one line and collapse the nav/CTA cleanly below the existing mobile breakpoint.

- [ ] **Step 6: Tune the homepage CSS for the new hierarchy**

Use the existing tokens and update only the affected homepage rules:

- Give `.about-section` the first-entry spacing and preserve the two-column image/text rhythm.
- Let the entry title use the larger `clamp()` scale appropriate to the page `h1`, while keeping line-height compact and readable.
- Add spacing for `.about-copy .button-primary` and `.site-header-cta`.
- Change `.support-section` to a generous editorial block with no grid/card styling.
- Keep `.audience-section` as the dark-green transition and `.contact-section` as the approved cream panel.
- Add mobile rules that stack image above copy, make the CTA full-width only when needed, and prevent horizontal overflow.

- [ ] **Step 7: Run the focused tests and typecheck**

Run: `npm test -- tests/homepage-content.test.ts`

Expected: PASS for all homepage content contracts.

Run: `npm run lint`

Expected: PASS with no TypeScript errors or unused imports introduced by removing the old hero/support-card paths.

- [ ] **Step 8: Commit the homepage slice**

```bash
git add app/page.tsx app/globals.css components/site-header.tsx components/about-section.tsx components/support-section.tsx lib/content.ts tests/homepage-content.test.ts
git commit -m "feat: focus homepage on therapist introduction"
```

---

### Task 3: Align login, portal and local development access

**Files:**
- Modify: `app/entrar/page.tsx`
- Modify: `app/globals.css`
- Modify: `README.md`
- Verify unchanged: `components/auth-form.tsx`, `components/portal-shell.tsx`, `components/admin-shell.tsx`, `prisma/seed.ts`, appointment API and agenda components

**Interfaces:**
- Consumes: the existing `AuthForm` login flow, `process.env.NODE_ENV`, and the seeded emails from `prisma/seed.ts`.
- Produces: a development-only account reference panel and a portal/admin shell that uses `var(--forest-deep)` instead of the isolated blue.

- [ ] **Step 1: Add the development-only account reference**

In `app/entrar/page.tsx`, keep the current `AuthForm` and add a small panel after it, guarded by `process.env.NODE_ENV !== "production"`:

```tsx
{process.env.NODE_ENV !== "production" && (
  <aside className="dev-access" aria-label="Contas de desenvolvimento">
    <p className="dev-access-title">Contas locais</p>
    <p>Use a senha definida em <code>SEED_PASSWORD</code> após rodar <code>npm run db:seed</code>.</p>
    <ul>
      <li><strong>Paciente:</strong> cliente@teka.local</li>
      <li><strong>Terapeuta:</strong> terapeuta@teka.local</li>
      <li><strong>Admin:</strong> admin@teka.local</li>
    </ul>
  </aside>
)}
```

Do not render the actual password into the page. Preserve the existing redirect behavior in `AuthForm`.

- [ ] **Step 2: Replace the portal blue with the brand token**

Change the existing rule in `app/globals.css` from:

```css
.portal-topbar { background: #062851; }
```

to the equivalent token-based rule:

```css
.portal-topbar { background: var(--forest-deep); }
```

Keep the gold mark, readable white text, current links, and mobile overflow behavior. Add `.dev-access` styles using `var(--paper-deep)`, `var(--line)`, `var(--forest)` and `var(--muted)` so the panel feels like part of the same system.

- [ ] **Step 3: Clarify seeded-account setup in README**

Add a short note under the existing local account list explaining that `npm run db:seed` creates/upserts the three accounts, all use the password from `SEED_PASSWORD`, and the therapist account is the one used to review agenda requests and save availability.

- [ ] **Step 4: Verify the appointment surface was not changed**

Run:

```bash
rg -n "create|update|availability|appointment|AppointmentRequest" app/admin components/availability-form.tsx app/api/v1/availability app/api/v1/appointment-requests prisma/seed.ts
```

Expected: the existing agenda handlers and API files remain present; only the login/visual files have changed in this task.

- [ ] **Step 5: Run typecheck and tests**

Run: `npm run lint`

Expected: PASS.

Run: `npm test`

Expected: all existing appointment-request tests and the new homepage content tests PASS.

- [ ] **Step 6: Commit the auth/portal slice**

```bash
git add app/entrar/page.tsx app/globals.css README.md
git commit -m "feat: align local access surfaces with brand"
```

---

### Task 4: Build and verify the complete local experience

**Files:**
- Verify: `app/page.tsx`, `app/entrar/page.tsx`, `app/cadastro/page.tsx`, `components/portal-shell.tsx`, `components/admin-shell.tsx`, `app/globals.css`
- Modify only if verification finds a concrete issue: the files above

**Interfaces:**
- Consumes: the completed homepage and auth/portal slices.
- Produces: a production-buildable local app with verified responsive and functional flows.

- [ ] **Step 1: Run the full test and build checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all tests pass, TypeScript emits no errors, and Next.js completes a production build.

- [ ] **Step 2: Start the local app for visual verification**

Run: `npm run dev`

Open `http://localhost:3000` and verify:

- The first block has the portrait beside “Sobre mim”.
- “Ansiedade”, “Exaustão” and “Relacionamentos” are absent.
- The menu, entry CTA and floating CTA point to the final contact section.
- The contact form remains visually aligned with the approved reference.

- [ ] **Step 3: Verify the authenticated visual surfaces**

Use the seeded accounts documented on `/entrar`:

- `cliente@teka.local` reaches `/portal` and can access scheduling/consultation links.
- `terapeuta@teka.local` reaches `/admin` and can open the agenda.
- `admin@teka.local` reaches `/admin` with the administrative links.

Confirm the top bar is green, not blue, and that the agenda route still saves availability/decisions using the existing handlers.

- [ ] **Step 4: Check responsive and accessibility behavior**

Verify desktop and mobile widths for no horizontal overflow, readable heading scale, stacked entry columns, usable form fields, keyboard-visible focus, descriptive portrait alt text, and reduced-motion fallback.

- [ ] **Step 5: Record final status**

Run `git status --short` and report the verification commands and any remaining local-only limitations. Do not claim completion until all expected checks have passed.
