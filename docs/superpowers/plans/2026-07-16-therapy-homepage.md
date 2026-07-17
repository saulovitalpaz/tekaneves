# Therapy Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a responsive Portuguese homepage for Teka Neves, running locally, with a visual language inspired by the provided references and a clean boundary for future patient features.

**Architecture:** Create a small Next.js App Router application with a single public homepage. Keep copy and therapist information in a local content module, keep the contact form as a client-only local interaction, and isolate future portal routes conceptually without implementing authentication or persistence.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide React, local image assets.

## Global Constraints

- Development must remain local at `http://localhost:3000`.
- No database, authentication, external API, analytics, payment, or external network request is required.
- All visible copy must be in Brazilian Portuguese.
- Use `profile.jpeg` as the therapist portrait and preserve the provided reference files.
- Keep the page light, marfim, verde profundo and dourado suave, with one consistent theme.
- Respect reduced motion, keyboard navigation, focus visibility, semantic headings and responsive layout.

---

### Task 1: Scaffold the local Next.js application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/images/profile.jpeg`

**Interfaces:**
- Produces a runnable Next.js app at `http://localhost:3000`.
- Exposes the global CSS variables and page shell used by later tasks.

- [ ] **Step 1: Add the package manifest and scripts**

Create scripts for `dev`, `build`, `start` and `lint`, with dependencies for Next.js, React, Tailwind CSS and Lucide React.

- [ ] **Step 2: Add the root layout and a minimal page**

Set metadata for Teka Neves, import the global stylesheet and render a semantic `main` element from `app/page.tsx`.

- [ ] **Step 3: Copy the portrait into public assets**

Use the existing `profile.jpeg` as `public/images/profile.jpeg`; do not modify the original reference asset.

- [ ] **Step 4: Install dependencies and run the empty app**

Run `npm install`, then `npm run dev`. Open `http://localhost:3000` and verify the page responds.

### Task 2: Establish the design tokens and content model

**Files:**
- Create: `lib/content.ts`
- Modify: `app/globals.css`

**Interfaces:**
- `lib/content.ts` exports `siteContent` with brand, hero, support areas, about copy and contact labels.
- CSS variables expose the shared marfim, ink, forest, gold, border and muted colors.

- [ ] **Step 1: Define the local content object**

Keep all visible copy in `siteContent`, including the therapist name, navigation labels, hero title, support areas and form labels. Use broad psychotherapy language and avoid student-only positioning.

- [ ] **Step 2: Add typography and color tokens**

Load a serif display face and a sans-serif body face through local CSS fallbacks and define responsive spacing, focus ring, button and section utilities.

- [ ] **Step 3: Verify the content module compiles**

Run `npm run lint` and confirm there are no implicit `any` values or unused exports.

### Task 3: Build the public homepage sections

**Files:**
- Create: `components/site-header.tsx`
- Create: `components/hero-section.tsx`
- Create: `components/support-section.tsx`
- Create: `components/about-section.tsx`
- Create: `components/contact-section.tsx`
- Create: `components/site-footer.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Each component accepts the relevant typed subset of `siteContent`.
- `app/page.tsx` composes the sections in the approved order and supplies stable IDs: `acompanhamento`, `para-quem`, `sobre`, `contato`.

- [ ] **Step 1: Implement the header**

Render the Teka Neves mark, anchor links and a contact CTA. Keep the desktop header on one line and provide a compact mobile layout without requiring a menu library.

- [ ] **Step 2: Implement the hero**

Use a two-column responsive layout. Place the hero copy on the left and `next/image` with `profile.jpeg` on the right, layered with CSS organic shapes. Keep the primary CTA visible without scrolling on desktop.

- [ ] **Step 3: Implement support, audience and about sections**

Use distinct layout families: a support grid, an inclusive audience statement and an image-led about block. Avoid repetitive equal cards and keep each section visually calm.

- [ ] **Step 4: Implement contact and footer**

Add the local contact form container and a footer with navigation and a clear statement that the current site is informational and local-only during development.

- [ ] **Step 5: Compose and lint the homepage**

Run `npm run lint`; verify all links target existing IDs and all images have descriptive `alt` text.

### Task 4: Add local contact form behavior

**Files:**
- Create: `components/contact-form.tsx`
- Modify: `components/contact-section.tsx`

**Interfaces:**
- `ContactForm` is a client component with local state only.
- It accepts field labels and a submit label from `siteContent` and emits no network request.

- [ ] **Step 1: Render controlled fields**

Implement name, email and message inputs with labels, autocomplete attributes, `required`, and an `aria-live` feedback region.

- [ ] **Step 2: Add client-side validation**

Reject blank values and invalid email format, preserving field values and associating messages with inputs via `aria-describedby`.

- [ ] **Step 3: Add local success state**

On valid submit, prevent navigation, clear the fields and show a success message that explicitly says the form is only a local preview and has not been sent.

- [ ] **Step 4: Verify keyboard and reduced-motion behavior**

Use the keyboard to reach every field and button; confirm focus styles are visible and no motion is required to understand the feedback.

### Task 5: Validate the local deliverable

**Files:**
- Modify: any page or CSS files required by verification findings.

**Interfaces:**
- No new runtime interfaces. This task confirms the app meets the approved acceptance criteria.

- [ ] **Step 1: Run the production build**

Run `npm run build`. Expected result: successful Next.js production compilation with no TypeScript errors.

- [ ] **Step 2: Run the local server**

Run `npm run dev` and verify `http://localhost:3000` loads the complete homepage.

- [ ] **Step 3: Check responsive behavior**

Verify desktop, tablet and mobile widths, including no horizontal overflow, readable hero copy and usable contact form.

- [ ] **Step 4: Check accessibility basics**

Verify heading order, link focus, form labels, image alt text, color contrast and reduced-motion fallback.

- [ ] **Step 5: Record the local handoff**

Document the start command and future route boundaries in `README.md`, without adding external deployment or service configuration.
