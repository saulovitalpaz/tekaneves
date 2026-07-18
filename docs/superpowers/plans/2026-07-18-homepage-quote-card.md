# Homepage Quote Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um card editável na homepage com frase de autoajuda em português, controlado por `ADMIN` e `THERAPIST`, com modo automático via API externa cacheado por 1 hora.

**Architecture:** A homepage lê uma configuração persistida em `HomepageQuoteSettings` e renderiza um card server-rendered quando estiver visível. A geração automática roda somente no servidor por meio de adaptadores isolados para frase externa e tradução, com cache em memória de 1 hora e fallback manual. O painel `/admin` recebe um formulário client component que salva via endpoint protegido.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma/SQLite, Zod, node:test, CSS global existente.

## Global Constraints

- Admin e terapeuta podem ligar/desligar a exibição do card.
- Admin e terapeuta podem alternar entre modo manual e automático.
- Admin e terapeuta podem editar a frase manual e o autor manual.
- A homepage pública renderiza o card somente quando a configuração estiver visível.
- O modo automático usa uma rota/helper server-side com cache compartilhado de 1 hora.
- Se a busca externa ou a tradução falhar, a frase manual salva no painel é exibida como fallback.
- Não fazer chamada direta da API externa pelo navegador do visitante.
- Não alterar modelos de contato, consultas, mensagens internas ou pré-cadastros.
- Validar migrations em banco SQLite temporário porque o `dev.db` local tem drift conhecido.
- APIs externas escolhidas: DummyJSON quotes random (`https://dummyjson.com/quotes/random`) e MyMemory REST API (`https://api.mymemory.translated.net/get?q=...&langpair=en|pt-BR`).

---

## File Structure

- `prisma/schema.prisma` — adiciona `HomepageQuoteSettings`.
- `prisma/migrations/20260718150000_add_homepage_quote_settings/migration.sql` — cria a tabela.
- `prisma/seed.ts` — cria configuração inicial segura.
- `lib/validation.ts` — adiciona `homepageQuoteSettingsSchema`.
- `lib/homepage-quote.ts` — concentra defaults, leitura/gravação da configuração, cache de 1 hora e resolução da frase pública.
- `app/api/v1/admin/homepage-quote/route.ts` — `GET` e `PATCH` protegidos para painel.
- `components/homepage-quote-card.tsx` — card público server-compatible, sem hooks.
- `components/homepage-quote-settings-form.tsx` — formulário client-side para admin/terapeuta.
- `app/page.tsx` — busca frase resolvida e renderiza card abaixo de `HomeEntry`.
- `app/admin/page.tsx` — busca configuração e renderiza formulário de controle.
- `app/globals.css` — estilos do card público e do formulário.
- `tests/homepage-quote-settings.test.ts` — validação, helper, fallback e cache.
- `tests/homepage-quote-admin.test.ts` — endpoint protegido e atualização.
- `tests/homepage-content.test.ts` — renderização/ocultação do card na homepage.

### Task 1: Add Homepage Quote Data Boundary

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260718150000_add_homepage_quote_settings/migration.sql`
- Modify: `prisma/seed.ts`
- Modify: `lib/validation.ts`
- Create: `tests/homepage-quote-settings.test.ts`

**Interfaces:**
- Produces: `homepageQuoteSettingsSchema`
- Produces: Prisma model `HomepageQuoteSettings`

- [ ] **Step 1: Write the failing validation and schema presence tests**

Add to `tests/homepage-quote-settings.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { homepageQuoteSettingsSchema } from "@/lib/validation";

test("homepage quote settings validation accepts a complete configuration", () => {
  const parsed = homepageQuoteSettingsSchema.safeParse({
    isQuoteCardVisible: true,
    isAutoGenerateActive: true,
    manualQuoteText: "A persistência abre espaço para novas respostas.",
    manualQuoteAuthor: "Teka Neves",
  });

  assert.equal(parsed.success, true);
});

test("homepage quote settings validation rejects empty manual fallback content", () => {
  const parsed = homepageQuoteSettingsSchema.safeParse({
    isQuoteCardVisible: true,
    isAutoGenerateActive: true,
    manualQuoteText: "",
    manualQuoteAuthor: "",
  });

  assert.equal(parsed.success, false);
});

test("schema declares homepage quote settings separately from inquiry data", async () => {
  const schema = await readFile("prisma/schema.prisma", "utf8");

  assert.match(schema, /model HomepageQuoteSettings/);
  assert.match(schema, /isQuoteCardVisible\s+Boolean\s+@default\(false\)/);
  assert.match(schema, /isAutoGenerateActive\s+Boolean\s+@default\(false\)/);
  assert.match(schema, /manualQuoteText\s+String/);
  assert.match(schema, /manualQuoteAuthor\s+String/);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- tests/homepage-quote-settings.test.ts
```

Expected: FAIL because `homepageQuoteSettingsSchema` and `HomepageQuoteSettings` do not exist.

- [ ] **Step 3: Add validation schema**

Append before `homepageInquirySchema` in `lib/validation.ts`:

```ts
export const homepageQuoteSettingsSchema = z.object({
  isQuoteCardVisible: z.boolean(),
  isAutoGenerateActive: z.boolean(),
  manualQuoteText: z.string().trim().min(3, "Escreva uma frase").max(240, "A frase deve ter até 240 caracteres"),
  manualQuoteAuthor: z.string().trim().min(2, "Informe o autor").max(80, "O autor deve ter até 80 caracteres"),
});
```

- [ ] **Step 4: Add Prisma model**

Append after `HomepageInquiry` in `prisma/schema.prisma`:

```prisma
model HomepageQuoteSettings {
  id                   String   @id @default(cuid())
  isQuoteCardVisible   Boolean  @default(false)
  isAutoGenerateActive Boolean  @default(false)
  manualQuoteText      String
  manualQuoteAuthor    String
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

- [ ] **Step 5: Add migration SQL**

Create `prisma/migrations/20260718150000_add_homepage_quote_settings/migration.sql`:

```sql
CREATE TABLE "HomepageQuoteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isQuoteCardVisible" BOOLEAN NOT NULL DEFAULT false,
    "isAutoGenerateActive" BOOLEAN NOT NULL DEFAULT false,
    "manualQuoteText" TEXT NOT NULL,
    "manualQuoteAuthor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
```

- [ ] **Step 6: Seed safe initial settings**

In `prisma/seed.ts`, after availability creation, add:

```ts
const existingQuoteSettings = await prisma.homepageQuoteSettings.findFirst();
if (existingQuoteSettings) {
  await prisma.homepageQuoteSettings.update({
    where: { id: existingQuoteSettings.id },
    data: {
      manualQuoteText: "A escuta cuidadosa ajuda a abrir novos caminhos.",
      manualQuoteAuthor: "Teka Neves",
    },
  });
} else {
  await prisma.homepageQuoteSettings.create({
    data: {
      isQuoteCardVisible: false,
      isAutoGenerateActive: false,
      manualQuoteText: "A escuta cuidadosa ajuda a abrir novos caminhos.",
      manualQuoteAuthor: "Teka Neves",
    },
  });
}
```

- [ ] **Step 7: Generate Prisma Client and run the focused test**

Run:

```bash
npm run db:generate
npm test -- tests/homepage-quote-settings.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit data boundary**

```bash
git add prisma/schema.prisma prisma/migrations/20260718150000_add_homepage_quote_settings/migration.sql prisma/seed.ts lib/validation.ts tests/homepage-quote-settings.test.ts
git commit -m "feat: add homepage quote settings"
```

### Task 2: Resolve Automatic Portuguese Quote Server-Side

**Files:**
- Modify: `tests/homepage-quote-settings.test.ts`
- Create: `lib/homepage-quote.ts`

**Interfaces:**
- Consumes: `homepageQuoteSettingsSchema`
- Produces:

```ts
export type ResolvedQuote = { text: string; author: string };
export type HomepageQuoteCardData = ResolvedQuote & { isAutoGenerated: boolean };
export const HOMEPAGE_QUOTE_CACHE_MS = 60 * 60 * 1000;
export async function getHomepageQuoteCard(options?: HomepageQuoteResolverOptions): Promise<HomepageQuoteCardData | null>;
export async function getHomepageQuoteSettings();
export async function updateHomepageQuoteSettings(input: HomepageQuoteSettingsInput);
```

- [ ] **Step 1: Extend tests for hidden, manual, fallback and cache behavior**

Append to `tests/homepage-quote-settings.test.ts`:

```ts
import { getHomepageQuoteCard, HOMEPAGE_QUOTE_CACHE_MS, resetHomepageQuoteCacheForTests } from "@/lib/homepage-quote";

test("homepage quote helper returns null when card is hidden", async () => {
  const quote = await getHomepageQuoteCard({
    now: 1000,
    settings: async () => ({
      isQuoteCardVisible: false,
      isAutoGenerateActive: false,
      manualQuoteText: "Frase manual",
      manualQuoteAuthor: "Autoria",
    }),
  });

  assert.equal(quote, null);
});

test("homepage quote helper returns manual quote when automatic mode is off", async () => {
  const quote = await getHomepageQuoteCard({
    now: 1000,
    settings: async () => ({
      isQuoteCardVisible: true,
      isAutoGenerateActive: false,
      manualQuoteText: "A pausa também trabalha por dentro.",
      manualQuoteAuthor: "Teka Neves",
    }),
  });

  assert.deepEqual(quote, {
    text: "A pausa também trabalha por dentro.",
    author: "Teka Neves",
    isAutoGenerated: false,
  });
});

test("homepage quote helper uses manual fallback when external quote translation fails", async () => {
  resetHomepageQuoteCacheForTests();
  const quote = await getHomepageQuoteCard({
    now: 2000,
    settings: async () => ({
      isQuoteCardVisible: true,
      isAutoGenerateActive: true,
      manualQuoteText: "Voltar a si também é movimento.",
      manualQuoteAuthor: "Teka Neves",
    }),
    fetchExternalQuote: async () => ({ text: "Keep going.", author: "Unknown" }),
    translateToPortuguese: async () => {
      throw new Error("TRANSLATION_FAILED");
    },
  });

  assert.deepEqual(quote, {
    text: "Voltar a si também é movimento.",
    author: "Teka Neves",
    isAutoGenerated: false,
  });
});

test("homepage quote helper caches automatic translated quote for one hour", async () => {
  resetHomepageQuoteCacheForTests();
  let calls = 0;
  const settings = async () => ({
    isQuoteCardVisible: true,
    isAutoGenerateActive: true,
    manualQuoteText: "Fallback",
    manualQuoteAuthor: "Teka Neves",
  });
  const fetchExternalQuote = async () => {
    calls += 1;
    return { text: `Keep going ${calls}.`, author: "Unknown" };
  };
  const translateToPortuguese = async (quote: { text: string; author: string }) => ({
    text: `Continue ${calls}.`,
    author: quote.author,
  });

  const first = await getHomepageQuoteCard({ now: 3000, settings, fetchExternalQuote, translateToPortuguese });
  const second = await getHomepageQuoteCard({ now: 3000 + HOMEPAGE_QUOTE_CACHE_MS - 1, settings, fetchExternalQuote, translateToPortuguese });
  const third = await getHomepageQuoteCard({ now: 3000 + HOMEPAGE_QUOTE_CACHE_MS + 1, settings, fetchExternalQuote, translateToPortuguese });

  assert.equal(calls, 2);
  assert.deepEqual(first, second);
  assert.deepEqual(third, { text: "Continue 2.", author: "Unknown", isAutoGenerated: true });
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- tests/homepage-quote-settings.test.ts
```

Expected: FAIL because `lib/homepage-quote.ts` does not exist.

- [ ] **Step 3: Implement server helper and adapters**

Create `lib/homepage-quote.ts`:

```ts
import { prisma } from "@/lib/db";
import { homepageQuoteSettingsSchema } from "@/lib/validation";

export type ResolvedQuote = { text: string; author: string };
export type HomepageQuoteCardData = ResolvedQuote & { isAutoGenerated: boolean };
export type HomepageQuoteSettingsInput = {
  isQuoteCardVisible: boolean;
  isAutoGenerateActive: boolean;
  manualQuoteText: string;
  manualQuoteAuthor: string;
};

type HomepageQuoteSettings = HomepageQuoteSettingsInput;

export type HomepageQuoteResolverOptions = {
  now?: number;
  settings?: () => Promise<HomepageQuoteSettings>;
  fetchExternalQuote?: () => Promise<ResolvedQuote>;
  translateToPortuguese?: (quote: ResolvedQuote) => Promise<ResolvedQuote>;
};

export const HOMEPAGE_QUOTE_CACHE_MS = 60 * 60 * 1000;

const fallbackSettings: HomepageQuoteSettings = {
  isQuoteCardVisible: false,
  isAutoGenerateActive: false,
  manualQuoteText: "A escuta cuidadosa ajuda a abrir novos caminhos.",
  manualQuoteAuthor: "Teka Neves",
};

let cachedQuote: { quote: HomepageQuoteCardData; expiresAt: number } | null = null;

function manualQuote(settings: HomepageQuoteSettings): HomepageQuoteCardData {
  return {
    text: settings.manualQuoteText,
    author: settings.manualQuoteAuthor,
    isAutoGenerated: false,
  };
}

export function resetHomepageQuoteCacheForTests() {
  cachedQuote = null;
}

export async function getHomepageQuoteSettings(): Promise<HomepageQuoteSettings> {
  const settings = await prisma.homepageQuoteSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (!settings) return fallbackSettings;

  return {
    isQuoteCardVisible: settings.isQuoteCardVisible,
    isAutoGenerateActive: settings.isAutoGenerateActive,
    manualQuoteText: settings.manualQuoteText,
    manualQuoteAuthor: settings.manualQuoteAuthor,
  };
}

export async function updateHomepageQuoteSettings(input: HomepageQuoteSettingsInput) {
  const data = homepageQuoteSettingsSchema.parse(input);
  const current = await prisma.homepageQuoteSettings.findFirst({ orderBy: { createdAt: "asc" } });
  cachedQuote = null;

  if (current) {
    return prisma.homepageQuoteSettings.update({ where: { id: current.id }, data });
  }

  return prisma.homepageQuoteSettings.create({ data });
}

async function fetchDummyJsonQuote(): Promise<ResolvedQuote> {
  const response = await fetch("https://dummyjson.com/quotes/random", { cache: "no-store" });
  if (!response.ok) throw new Error("QUOTE_FETCH_FAILED");
  const data = await response.json() as { quote?: unknown; author?: unknown };
  if (typeof data.quote !== "string" || typeof data.author !== "string") throw new Error("QUOTE_FETCH_INVALID");
  return { text: data.quote, author: data.author };
}

async function translateQuoteWithMyMemory(quote: ResolvedQuote): Promise<ResolvedQuote> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", quote.text);
  url.searchParams.set("langpair", "en|pt-BR");
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("TRANSLATION_FETCH_FAILED");
  const data = await response.json() as { responseData?: { translatedText?: unknown } };
  const translatedText = data.responseData?.translatedText;
  if (typeof translatedText !== "string" || translatedText.trim().length < 3) throw new Error("TRANSLATION_FETCH_INVALID");
  return { text: translatedText.trim(), author: quote.author };
}

export async function getHomepageQuoteCard(options: HomepageQuoteResolverOptions = {}): Promise<HomepageQuoteCardData | null> {
  const now = options.now ?? Date.now();
  const settings = await (options.settings ?? getHomepageQuoteSettings)();

  if (!settings.isQuoteCardVisible) return null;
  if (!settings.isAutoGenerateActive) return manualQuote(settings);
  if (cachedQuote && cachedQuote.expiresAt > now) return cachedQuote.quote;

  try {
    const fetchExternalQuote = options.fetchExternalQuote ?? fetchDummyJsonQuote;
    const translateToPortuguese = options.translateToPortuguese ?? translateQuoteWithMyMemory;
    const quote = await translateToPortuguese(await fetchExternalQuote());
    const resolved = { ...quote, isAutoGenerated: true };
    cachedQuote = { quote: resolved, expiresAt: now + HOMEPAGE_QUOTE_CACHE_MS };
    return resolved;
  } catch {
    return manualQuote(settings);
  }
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- tests/homepage-quote-settings.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit quote resolver**

```bash
git add lib/homepage-quote.ts tests/homepage-quote-settings.test.ts
git commit -m "feat: resolve homepage quotes server-side"
```

### Task 3: Add Protected Admin API And Settings Form

**Files:**
- Create: `app/api/v1/admin/homepage-quote/route.ts`
- Create: `components/homepage-quote-settings-form.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/homepage-quote-admin.test.ts`

**Interfaces:**
- Consumes: `getHomepageQuoteSettings()`, `updateHomepageQuoteSettings(input)`
- Produces: `/api/v1/admin/homepage-quote` GET/PATCH and `HomepageQuoteSettingsForm`

- [ ] **Step 1: Write failing API/UI tests**

Create `tests/homepage-quote-admin.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("homepage quote admin API is protected for admin and therapist roles", async () => {
  const source = await readFile("app/api/v1/admin/homepage-quote/route.ts", "utf8");

  assert.match(source, /getCurrentUser/);
  assert.match(source, /\["ADMIN", "THERAPIST"\]\.includes\(user\.role\)/);
  assert.match(source, /homepageQuoteSettingsSchema/);
  assert.match(source, /updateHomepageQuoteSettings/);
});

test("admin dashboard renders homepage quote settings controls", async () => {
  const [page, form] = await Promise.all([
    readFile("app/admin/page.tsx", "utf8"),
    readFile("components/homepage-quote-settings-form.tsx", "utf8"),
  ]);

  assert.match(page, /HomepageQuoteSettingsForm/);
  assert.match(page, /getHomepageQuoteSettings/);
  assert.match(form, /isQuoteCardVisible/);
  assert.match(form, /isAutoGenerateActive/);
  assert.match(form, /manualQuoteText/);
  assert.match(form, /manualQuoteAuthor/);
  assert.match(form, /\/api\/v1\/admin\/homepage-quote/);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- tests/homepage-quote-admin.test.ts
```

Expected: FAIL because the route and form do not exist.

- [ ] **Step 3: Implement protected API route**

Create `app/api/v1/admin/homepage-quote/route.ts`:

```ts
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { getHomepageQuoteSettings, updateHomepageQuoteSettings } from "@/lib/homepage-quote";
import { homepageQuoteSettingsSchema } from "@/lib/validation";

function canManageHomepageQuote(user: { role: string } | null) {
  return Boolean(user && ["ADMIN", "THERAPIST"].includes(user.role));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!canManageHomepageQuote(user)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);
  return apiData({ settings: await getHomepageQuoteSettings() });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!canManageHomepageQuote(user)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const parsed = homepageQuoteSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira a frase e as opções de exibição.", 400);

  const settings = await updateHomepageQuoteSettings(parsed.data);
  return apiData({ settings });
}
```

- [ ] **Step 4: Implement client form**

Create `components/homepage-quote-settings-form.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type HomepageQuoteSettingsFormProps = {
  settings: {
    isQuoteCardVisible: boolean;
    isAutoGenerateActive: boolean;
    manualQuoteText: string;
    manualQuoteAuthor: string;
  };
};

export function HomepageQuoteSettingsForm({ settings }: HomepageQuoteSettingsFormProps) {
  const router = useRouter();
  const [isQuoteCardVisible, setIsQuoteCardVisible] = useState(settings.isQuoteCardVisible);
  const [isAutoGenerateActive, setIsAutoGenerateActive] = useState(settings.isAutoGenerateActive);
  const [manualQuoteText, setManualQuoteText] = useState(settings.manualQuoteText);
  const [manualQuoteAuthor, setManualQuoteAuthor] = useState(settings.manualQuoteAuthor);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);

    const response = await fetch("/api/v1/admin/homepage-quote", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isQuoteCardVisible, isAutoGenerateActive, manualQuoteText, manualQuoteAuthor }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(true);
      setFeedback(result.error?.message ?? "Não foi possível salvar o card.");
      return;
    }

    setFeedback("Card da homepage atualizado.");
    router.refresh();
  }

  return (
    <form className="homepage-quote-settings-form" onSubmit={submit}>
      <label className="toggle-field">
        <input type="checkbox" checked={isQuoteCardVisible} onChange={(event) => setIsQuoteCardVisible(event.target.checked)} />
        <span>Exibir card na homepage</span>
      </label>
      <label className="toggle-field">
        <input type="checkbox" checked={isAutoGenerateActive} onChange={(event) => setIsAutoGenerateActive(event.target.checked)} />
        <span>Gerar frase automaticamente a cada hora</span>
      </label>
      <label>Frase manual
        <textarea value={manualQuoteText} onChange={(event) => setManualQuoteText(event.target.value)} required minLength={3} maxLength={240} />
      </label>
      <label>Autor
        <input value={manualQuoteAuthor} onChange={(event) => setManualQuoteAuthor(event.target.value)} required minLength={2} maxLength={80} />
      </label>
      {feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}
      <button className="button-primary" type="submit">Salvar card</button>
    </form>
  );
}
```

- [ ] **Step 5: Render form on admin dashboard**

Modify `app/admin/page.tsx`:

```tsx
import { HomepageQuoteSettingsForm } from "@/components/homepage-quote-settings-form";
import { getHomepageQuoteSettings } from "@/lib/homepage-quote";
```

Add `quoteSettings` to the existing `Promise.all`:

```tsx
const [pending, today, internalUnread, homepageUnread, quoteSettings] = await Promise.all([
  prisma.appointmentRequest.count({ where: { ...requestWhere, status: "PENDING" } }),
  prisma.appointment.count({ where: { ...requestWhere, status: "CONFIRMED", startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
  prisma.contactMessage.count({ where: user.role === "ADMIN" ? { recipient: { role: "THERAPIST" }, readAt: null } : { recipientId: user.id, readAt: null } }),
  prisma.homepageInquiry.count({ where: { readAt: null } }),
  getHomepageQuoteSettings(),
]);
```

Render after the dashboard grid:

```tsx
<section className="portal-panel">
  <div className="panel-heading">
    <div>
      <p className="eyebrow">Homepage</p>
      <h2 className="display-font">Card de frase</h2>
    </div>
  </div>
  <HomepageQuoteSettingsForm settings={quoteSettings} />
</section>
```

- [ ] **Step 6: Add admin form CSS**

Append near the form styles in `app/globals.css`:

```css
.homepage-quote-settings-form { display: grid; gap: 0.85rem; max-width: 680px; }
.homepage-quote-settings-form label { display: grid; gap: 0.45rem; color: var(--forest-deep); font-size: 0.85rem; font-weight: 700; }
.homepage-quote-settings-form input:not([type="checkbox"]), .homepage-quote-settings-form textarea { width: 100%; min-height: 44px; border: 1px solid var(--line); border-radius: 0.8rem; background: var(--paper); color: var(--ink); padding: 0.85rem 0.9rem; }
.homepage-quote-settings-form textarea { min-height: 110px; resize: vertical; }
.toggle-field { display: flex !important; grid-template-columns: none; align-items: center; gap: 0.65rem !important; }
.toggle-field input { width: 1.15rem; height: 1.15rem; accent-color: var(--forest); }
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- tests/homepage-quote-admin.test.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 8: Commit admin controls**

```bash
git add app/api/v1/admin/homepage-quote/route.ts components/homepage-quote-settings-form.tsx app/admin/page.tsx app/globals.css tests/homepage-quote-admin.test.ts
git commit -m "feat: manage homepage quote card"
```

### Task 4: Render Public Homepage Quote Card

**Files:**
- Create: `components/homepage-quote-card.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/homepage-content.test.ts`

**Interfaces:**
- Consumes: `getHomepageQuoteCard()`
- Produces: `HomepageQuoteCard({ quote }: { quote: HomepageQuoteCardData })`

- [ ] **Step 1: Write failing homepage tests**

Append to `tests/homepage-content.test.ts`:

```ts
test("homepage renders quote card from server data without public external fetch", async () => {
  const [page, card] = await Promise.all([
    readFile("app/page.tsx", "utf8"),
    readFile("components/homepage-quote-card.tsx", "utf8"),
  ]);

  assert.match(page, /getHomepageQuoteCard/);
  assert.match(page, /HomepageQuoteCard/);
  assert.doesNotMatch(card, /useEffect|useState|fetch\(/);
  assert.match(card, /homepage-quote-card/);
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm test -- tests/homepage-content.test.ts
```

Expected: FAIL because `components/homepage-quote-card.tsx` does not exist and `app/page.tsx` does not call the helper.

- [ ] **Step 3: Create public card**

Create `components/homepage-quote-card.tsx`:

```tsx
import { HomepageQuoteCardData } from "@/lib/homepage-quote";

export function HomepageQuoteCard({ quote }: { quote: HomepageQuoteCardData }) {
  return (
    <section className="section-shell homepage-quote-section" aria-labelledby="homepage-quote-title">
      <article className="homepage-quote-card">
        <p className="eyebrow" id="homepage-quote-title">Para lembrar</p>
        <blockquote>
          <p>{quote.text}</p>
          <footer>{quote.author}</footer>
        </blockquote>
      </article>
    </section>
  );
}
```

- [ ] **Step 4: Render card on homepage**

Modify `app/page.tsx`:

```tsx
import { HomeEntry } from "@/components/home-entry";
import { HomepageQuoteCard } from "@/components/homepage-quote-card";
import { PublicSiteFrame } from "@/components/public-site-frame";
import { getHomepageQuoteCard } from "@/lib/homepage-quote";
import { siteContent } from "@/lib/content";

export default async function HomePage() {
  const quote = await getHomepageQuoteCard();

  return (
    <PublicSiteFrame>
      <main>
        <HomeEntry content={siteContent.home} />
        {quote && <HomepageQuoteCard quote={quote} />}
      </main>
    </PublicSiteFrame>
  );
}
```

- [ ] **Step 5: Add public card CSS**

Append near homepage styles in `app/globals.css`:

```css
.homepage-quote-section { padding: 0 0 clamp(2rem, 5vw, 4.5rem); }
.homepage-quote-card { width: min(100%, 760px); margin: 0 auto; padding: clamp(1.25rem, 3vw, 2rem); border: 1px solid var(--line); border-radius: var(--card-radius); background: var(--surface); box-shadow: var(--card-shadow); text-align: center; }
.homepage-quote-card blockquote { margin: 0; }
.homepage-quote-card blockquote p { margin: 0.75rem auto 0; color: var(--forest-deep); font-family: var(--font-display); font-size: clamp(1.65rem, 4vw, 2.75rem); line-height: 1.12; }
.homepage-quote-card blockquote footer { margin-top: 1rem; color: var(--muted); font-size: 0.88rem; font-weight: 700; }
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/homepage-content.test.ts tests/homepage-quote-settings.test.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit public card**

```bash
git add components/homepage-quote-card.tsx app/page.tsx app/globals.css tests/homepage-content.test.ts
git commit -m "feat: render homepage quote card"
```

### Task 5: Verify Migration Chain And Production Build

**Files:**
- Modify: none unless verification finds a real defect in files from Tasks 1-4.

**Interfaces:**
- Consumes: completed quote settings, resolver, admin API, public card.
- Produces: verified implementation.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript check**

Run:

```bash
npm run lint
```

Expected: `tsc --noEmit` exits 0.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js production build completes.

- [ ] **Step 4: Verify migration chain on a temporary SQLite database**

Run:

```powershell
$env:DATABASE_URL = 'file:./verify-quote-card-migrate.db'
npx prisma migrate deploy --schema prisma/schema.prisma
Remove-Item -LiteralPath 'prisma\verify-quote-card-migrate.db' -Force
```

Expected: all migrations apply successfully, and the temporary database is removed.

- [ ] **Step 5: Check whitespace**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 6: Commit verification fixes if needed**

If verification required code changes, commit them:

```bash
git add prisma/schema.prisma prisma/seed.ts lib/validation.ts lib/homepage-quote.ts app/api/v1/admin/homepage-quote/route.ts components/homepage-quote-card.tsx components/homepage-quote-settings-form.tsx app/page.tsx app/admin/page.tsx app/globals.css tests/homepage-quote-settings.test.ts tests/homepage-quote-admin.test.ts tests/homepage-content.test.ts
git commit -m "fix: stabilize homepage quote card"
```

If no changes were needed, do not create an empty commit.

## External References

- DummyJSON quotes random endpoint documentation: https://dummyjson.com/docs/quotes
- MyMemory REST API `get` endpoint documentation: https://mymemory.translated.net/doc/spec.php
