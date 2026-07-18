# Agenda funcional e notas privadas de atendimento — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar `/admin/agenda` uma agenda operacional para Teka e Admin, com disponibilidades editáveis, consultas concluídas, notas clínicas privadas e histórico individual de cada cliente.

**Architecture:** O dado clínico fica em `AppointmentSummary`, uma relação um-para-um com `Appointment`, sem inclusão nas consultas usadas pelo portal do cliente. As rotas administrativas validam sessão, função e vínculo com a profissional antes de ler ou alterar qualquer agenda, disponibilidade ou nota. A tela de agenda concentra as ações de operação; o detalhe de cliente somente apresenta seu histórico e o lembrete da próxima consulta.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma 6 com SQLite, Zod, `node:test` e CSS global existente.

## Global Constraints

- A agenda operacional permanece exclusivamente em `/admin/agenda`.
- Teka (`THERAPIST`) acessa apenas registros cujo `therapistId` é o da sessão; `ADMIN` acessa todos os registros.
- Cliente não recebe rota, campo, contagem, indicador ou conteúdo de `AppointmentSummary`.
- Uma nota tem entre 1 e 4.000 caracteres e só pode existir para consulta `CONFIRMED` ou `COMPLETED`.
- Cada consulta possui no máximo uma nota; atualizações preservam a autoria original e atualizam `updatedAt`.
- Consultas `CANCELLED` não aceitam nota. Excluir uma disponibilidade não altera consultas confirmadas.
- Não adicionar dependências, prontuário completo, anexos, recorrência, notificações em tempo real ou integração externa de calendário.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `prisma/schema.prisma` | Relação `AppointmentSummary` e relações inversas. |
| `prisma/migrations/20260718100000_add_appointment_summaries/migration.sql` | Criar tabela, chave única da consulta e índices. |
| `lib/validation.ts` | Validar resumo, edição de disponibilidade e mudança de estado da consulta. |
| `lib/appointment-summaries.ts` | Centralizar status permitidos e o upsert que preserva o autor. |
| `app/api/v1/appointments/[id]/summary/route.ts` | Leitura e gravação autorizadas da nota privada. |
| `app/api/v1/appointments/[id]/route.ts` | Concluir ou cancelar uma consulta confirmada. |
| `app/api/v1/availability/admin/[id]/route.ts` | Editar e excluir uma janela de disponibilidade. |
| `components/availability-form.tsx` | Criar e editar uma janela em um mesmo formulário. |
| `components/availability-list.tsx` | Acionar edição e exclusão de uma disponibilidade renderizada no servidor. |
| `components/appointment-summary-form.tsx` | Salvar uma nota e concluir/cancelar a consulta sem sair da agenda. |
| `app/admin/agenda/page.tsx` | Resumo, próximas consultas, histórico, disponibilidades e solicitações. |
| `app/admin/clientes/page.tsx` | Link para o detalhe de cada cliente autorizado. |
| `app/admin/clientes/[id]/page.tsx` | Próxima consulta e histórico administrativo de um cliente. |
| `app/globals.css` | Estilos responsivos dos novos controles, listas e cartões. |
| `tests/appointment-summary.test.ts` | Dados, limites de status e isolamento por profissional. |
| `tests/agenda-ui.test.ts` | Presença das rotas administrativas e ausência de notas no portal do cliente. |

### Task 1: Persistir o resumo privado com uma relação um-para-um

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260718100000_add_appointment_summaries/migration.sql`
- Create: `lib/appointment-summaries.ts`
- Create: `tests/appointment-summary.test.ts`

**Interfaces:**
- Produces: `appointmentSummaryBodySchema`, `SUMMARY_ELIGIBLE_STATUSES` e `upsertAppointmentSummary(input)` para as rotas e a agenda.
- Produces: `Appointment.summary` e `User.authoredAppointmentSummaries` no Prisma Client regenerado.

- [ ] **Step 1: Escrever o teste de persistência e estados aceitos**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { AppointmentStatus } from "@prisma/client";
import { isSummaryEligible, upsertAppointmentSummary } from "@/lib/appointment-summaries";
import { prisma } from "@/lib/db";

test("mantém uma única nota por consulta e preserva o primeiro autor", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [client, therapist] = await Promise.all([
    prisma.user.create({ data: { name: "Cliente", email: `client-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
    prisma.user.create({ data: { name: "Teka", email: `teka-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
  ]);
  const request = await prisma.appointmentRequest.create({ data: { clientId: client.id, therapistId: therapist.id, desiredStart: new Date("2030-01-01T10:00:00.000Z"), durationMinutes: 50, message: "Consulta" } });
  const appointment = await prisma.appointment.create({ data: { requestId: request.id, clientId: client.id, therapistId: therapist.id, startAt: new Date("2030-01-01T10:00:00.000Z"), endAt: new Date("2030-01-01T10:50:00.000Z") } });

  try {
    const created = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: therapist.id, body: "Primeiro resumo." });
    const updated = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: client.id, body: "Resumo atualizado." });

    assert.equal(created.authorId, therapist.id);
    assert.equal(updated.id, created.id);
    assert.equal(updated.authorId, therapist.id);
    assert.equal(updated.body, "Resumo atualizado.");
    assert.equal(await prisma.appointmentSummary.count({ where: { appointmentId: appointment.id } }), 1);
  } finally {
    await prisma.appointmentSummary.deleteMany({ where: { appointmentId: appointment.id } });
    await prisma.user.deleteMany({ where: { id: { in: [client.id, therapist.id] } } });
  }
});

test("permite nota apenas em consultas confirmadas ou concluídas", () => {
  assert.equal(isSummaryEligible(AppointmentStatus.CONFIRMED), true);
  assert.equal(isSummaryEligible(AppointmentStatus.COMPLETED), true);
  assert.equal(isSummaryEligible(AppointmentStatus.CANCELLED), false);
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npx tsx --test tests/appointment-summary.test.ts`

Expected: FAIL porque `AppointmentSummary`, `isSummaryEligible` e `upsertAppointmentSummary` ainda não existem.

- [ ] **Step 3: Adicionar o modelo, relações e validação**

Em `prisma/schema.prisma`, adicionar as relações inversas e o modelo abaixo:

```prisma
model User {
  authoredAppointmentSummaries AppointmentSummary[]
}

model Appointment {
  summary AppointmentSummary?
}

model AppointmentSummary {
  id            String      @id @default(cuid())
  appointmentId String      @unique
  authorId      String
  body          String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  author        User        @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([authorId, updatedAt])
}
```

Em `lib/validation.ts`, acrescentar:

```ts
export const appointmentSummaryBodySchema = z.object({
  body: z.string().trim().min(1, "Escreva um resumo breve").max(4000, "O resumo deve ter até 4000 caracteres"),
});

export const appointmentStatusUpdateSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});
```

Criar `lib/appointment-summaries.ts`:

```ts
import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export const SUMMARY_ELIGIBLE_STATUSES = [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] as const;

export function isSummaryEligible(status: AppointmentStatus) {
  return SUMMARY_ELIGIBLE_STATUSES.includes(status as (typeof SUMMARY_ELIGIBLE_STATUSES)[number]);
}

export async function upsertAppointmentSummary(input: { appointmentId: string; authorId: string; body: string }) {
  return prisma.appointmentSummary.upsert({
    where: { appointmentId: input.appointmentId },
    create: input,
    update: { body: input.body },
  });
}
```

- [ ] **Step 4: Criar a migração explícita e gerar o Prisma Client**

Criar `prisma/migrations/20260718100000_add_appointment_summaries/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "AppointmentSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppointmentSummary_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppointmentSummary_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentSummary_appointmentId_key" ON "AppointmentSummary"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentSummary_authorId_updatedAt_idx" ON "AppointmentSummary"("authorId", "updatedAt");
```

Run: `npx prisma migrate dev && npx prisma generate`

Expected: a migração é aplicada e o Prisma Client é gerado sem erro.

- [ ] **Step 5: Executar o teste de dados**

Run: `npx tsx --test tests/appointment-summary.test.ts`

Expected: PASS com os dois testes verdes.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/validation.ts lib/appointment-summaries.ts tests/appointment-summary.test.ts
git commit -m "feat: persist private appointment summaries"
```

### Task 2: Proteger a API de notas e permitir concluir ou cancelar consulta

**Files:**
- Modify: `lib/validation.ts`
- Create: `app/api/v1/appointments/[id]/summary/route.ts`
- Create: `app/api/v1/appointments/[id]/route.ts`
- Modify: `tests/appointment-summary.test.ts`

**Interfaces:**
- Consumes: `appointmentSummaryBodySchema`, `appointmentStatusUpdateSchema`, `isSummaryEligible` e `upsertAppointmentSummary` da Task 1.
- Produces: `GET`/`PUT /api/v1/appointments/:id/summary` e `PATCH /api/v1/appointments/:id`.

- [ ] **Step 1: Escrever testes de autorização como escopos de consulta**

Acrescentar a `tests/appointment-summary.test.ts` o teste abaixo para fixar a regra usada pelas duas rotas:

```ts
test("isola consultas de outra profissional e mantém Admin com visão geral", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [client, owner, other] = await Promise.all([
    prisma.user.create({ data: { name: "Cliente", email: `client-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
    prisma.user.create({ data: { name: "Responsável", email: `owner-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
    prisma.user.create({ data: { name: "Outra", email: `other-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
  ]);
  const request = await prisma.appointmentRequest.create({ data: { clientId: client.id, therapistId: owner.id, desiredStart: new Date("2030-02-01T10:00:00.000Z"), durationMinutes: 50, message: "Consulta" } });
  const appointment = await prisma.appointment.create({ data: { requestId: request.id, clientId: client.id, therapistId: owner.id, startAt: new Date("2030-02-01T10:00:00.000Z"), endAt: new Date("2030-02-01T10:50:00.000Z") } });

  try {
    assert.equal(await prisma.appointment.findFirst({ where: { id: appointment.id, therapistId: other.id } }), null);
    assert.equal((await prisma.appointment.findUnique({ where: { id: appointment.id } }))?.therapistId, owner.id);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [client.id, owner.id, other.id] } } });
  }
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha de cobertura**

Run: `npx tsx --test tests/appointment-summary.test.ts`

Expected: PASS de dados atuais; o teste novo documenta o escopo obrigatório antes da implementação das rotas.

- [ ] **Step 3: Criar a rota de leitura e gravação do resumo**

Criar `app/api/v1/appointments/[id]/summary/route.ts` com uma consulta única que só localiza o atendimento quando o ator é Admin ou a profissional responsável:

```ts
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isSummaryEligible, upsertAppointmentSummary } from "@/lib/appointment-summaries";
import { appointmentSummaryBodySchema } from "@/lib/validation";

async function findManagedAppointment(user: { id: string; role: string }, id: string) {
  if (!["ADMIN", "THERAPIST"].includes(user.role)) return null;
  return prisma.appointment.findFirst({
    where: user.role === "ADMIN" ? { id } : { id, therapistId: user.id },
    include: { summary: true },
  });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar o resumo.", 401);
  const { id } = await context.params;
  const appointment = await findManagedAppointment(user, id);
  if (!appointment) return apiError("FORBIDDEN", "Você não pode acessar este resumo.", 403);
  if (!isSummaryEligible(appointment.status)) return apiError("SUMMARY_UNAVAILABLE", "Esta consulta não aceita resumo.", 409);
  return apiData({ summary: appointment.summary });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para registrar o resumo.", 401);
  const parsed = appointmentSummaryBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o resumo do atendimento.", 400);
  const { id } = await context.params;
  const appointment = await findManagedAppointment(user, id);
  if (!appointment) return apiError("FORBIDDEN", "Você não pode alterar este resumo.", 403);
  if (!isSummaryEligible(appointment.status)) return apiError("SUMMARY_UNAVAILABLE", "Esta consulta não aceita resumo.", 409);
  const summary = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: user.id, body: parsed.data.body });
  return apiData({ summary });
}
```

- [ ] **Step 4: Criar a rota de mudança de estado**

Criar `app/api/v1/appointments/[id]/route.ts`:

```ts
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { appointmentStatusUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);
  const parsed = appointmentStatusUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o novo estado da consulta.", 400);
  const { id } = await context.params;
  const appointment = await prisma.appointment.findFirst({ where: user.role === "ADMIN" ? { id } : { id, therapistId: user.id } });
  if (!appointment) return apiError("FORBIDDEN", "Você não pode alterar esta consulta.", 403);
  if (appointment.status !== "CONFIRMED") return apiError("INVALID_STATUS_TRANSITION", "Somente consultas confirmadas podem ser concluídas ou canceladas.", 409);
  const updated = await prisma.appointment.update({ where: { id }, data: { status: parsed.data.status } });
  return apiData({ id: updated.id, status: updated.status });
}
```

- [ ] **Step 5: Executar os testes e a verificação de tipos**

Run: `npx tsx --test tests/appointment-summary.test.ts && npm run lint`

Expected: PASS; TypeScript reconhece as duas rotas e os tipos do Prisma.

- [ ] **Step 6: Commit**

```bash
git add lib/validation.ts app/api/v1/appointments tests/appointment-summary.test.ts
git commit -m "feat: secure appointment summaries and completion"
```

### Task 3: Permitir editar e excluir disponibilidades da própria agenda

**Files:**
- Modify: `lib/validation.ts`
- Create: `app/api/v1/availability/admin/[id]/route.ts`
- Modify: `components/availability-form.tsx`
- Create: `components/availability-list.tsx`
- Create: `tests/availability-management.test.ts`

**Interfaces:**
- Consumes: `availabilitySchema` existente.
- Produces: `availabilityUpdateSchema` e as ações `PATCH`/`DELETE /api/v1/availability/admin/:id`.

- [ ] **Step 1: Escrever o teste de intervalo de edição**

Criar `tests/availability-management.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { availabilityUpdateSchema } from "@/lib/validation";

test("rejeita disponibilidade cujo fim não sucede o início", () => {
  const result = availabilityUpdateSchema.safeParse({ weekday: 1, startMinutes: 1020, endMinutes: 540, timezone: "America/Sao_Paulo", isActive: true });
  assert.equal(result.success, false);
});

test("aceita uma janela válida para edição", () => {
  const result = availabilityUpdateSchema.safeParse({ weekday: 1, startMinutes: 540, endMinutes: 1020, timezone: "America/Sao_Paulo", isActive: true });
  assert.equal(result.success, true);
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npx tsx --test tests/availability-management.test.ts`

Expected: FAIL porque `availabilityUpdateSchema` ainda não existe.

- [ ] **Step 3: Extrair o esquema de edição e implementar as rotas**

Em `lib/validation.ts`, definir o esquema sem `therapistId`:

```ts
export const availabilityUpdateSchema = availabilitySchema.omit({ therapistId: true });
```

Criar `app/api/v1/availability/admin/[id]/route.ts`:

```ts
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { availabilityUpdateSchema } from "@/lib/validation";

async function findManagedAvailability(user: { id: string; role: string }, id: string) {
  if (!["ADMIN", "THERAPIST"].includes(user.role)) return null;
  return prisma.availability.findFirst({
    where: user.role === "ADMIN" ? { id } : { id, therapistProfile: { userId: user.id } },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para editar a disponibilidade.", 401);
  const parsed = availabilityUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o intervalo de atendimento.", 400);
  const { id } = await context.params;
  if (!await findManagedAvailability(user, id)) return apiError("FORBIDDEN", "Você não pode editar esta disponibilidade.", 403);
  const availability = await prisma.availability.update({ where: { id }, data: parsed.data });
  return apiData({ availability });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para excluir a disponibilidade.", 401);
  const { id } = await context.params;
  if (!await findManagedAvailability(user, id)) return apiError("FORBIDDEN", "Você não pode excluir esta disponibilidade.", 403);
  await prisma.availability.delete({ where: { id } });
  return apiData({ id });
}
```

- [ ] **Step 4: Transformar o formulário em criação/edição e criar a lista de ações**

Atualizar a interface de `AvailabilityForm` para receber um item opcional e escolher a rota pelo `availability.id`:

```ts
type AvailabilityValues = { id?: string; weekday: number; startMinutes: number; endMinutes: number; timezone: string; isActive: boolean };

export function AvailabilityForm({ therapistId, availability, onDone }: { therapistId: string; availability?: AvailabilityValues; onDone?: () => void }) {
  const method = availability ? "PATCH" : "POST";
  const url = availability ? `/api/v1/availability/admin/${availability.id}` : "/api/v1/availability/admin";
  const payload = { weekday, startMinutes, endMinutes, timezone: "America/Sao_Paulo", isActive: true, ...(availability ? {} : { therapistId }) };
  // Usar fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).
}
```

Criar `components/availability-list.tsx` como componente cliente que renderiza cada janela, mostra `AvailabilityForm` apenas no item em edição e remove pelo endpoint acima:

```tsx
<button type="button" onClick={() => setEditingId(item.id)}>Editar</button>
<button type="button" onClick={() => void remove(item.id)}>Excluir</button>
```

Após `PATCH`, `POST` ou `DELETE`, chamar `router.refresh()` e fechar a edição. A exclusão não consulta nem altera `Appointment`.

- [ ] **Step 5: Executar os testes de validação e tipos**

Run: `npx tsx --test tests/availability-management.test.ts && npm run lint`

Expected: PASS; a rota recebe somente dados de janela na edição.

- [ ] **Step 6: Commit**

```bash
git add lib/validation.ts app/api/v1/availability components/availability-form.tsx components/availability-list.tsx tests/availability-management.test.ts
git commit -m "feat: manage therapist availability windows"
```

### Task 4: Exibir e operar a agenda completa em `/admin/agenda`

**Files:**
- Modify: `app/admin/agenda/page.tsx`
- Create: `components/appointment-summary-form.tsx`
- Modify: `app/globals.css`
- Create: `tests/agenda-ui.test.ts`

**Interfaces:**
- Consumes: rotas das Tasks 2 e 3, `AvailabilityList` e dados `Appointment.summary` da Task 1.
- Produces: cartões de contagem, próximas consultas, histórico, ações de concluir/cancelar e formulário de nota.

- [ ] **Step 1: Escrever o teste de estrutura da agenda e sigilo do portal**

Criar `tests/agenda-ui.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a agenda administrativa inclui consultas confirmadas, concluídas e notas", async () => {
  const source = await readFile("app/admin/agenda/page.tsx", "utf8");
  assert.match(source, /AppointmentStatus\.CONFIRMED/);
  assert.match(source, /AppointmentStatus\.COMPLETED/);
  assert.match(source, /AppointmentSummaryForm/);
});

test("o portal do cliente não consulta resumo clínico", async () => {
  const source = await readFile("app/portal/consultas/page.tsx", "utf8");
  assert.doesNotMatch(source, /summary|AppointmentSummary/i);
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npx tsx --test tests/agenda-ui.test.ts`

Expected: FAIL porque a agenda ainda não consulta `AppointmentStatus.COMPLETED` nem renderiza `AppointmentSummaryForm`.

- [ ] **Step 3: Criar o formulário de nota e de conclusão**

Criar `components/appointment-summary-form.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AppointmentSummaryForm({ appointmentId, initialBody, status }: { appointmentId: string; initialBody: string; status: "CONFIRMED" | "COMPLETED" }) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/v1/appointments/${appointmentId}/summary`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    if (!response.ok) { setError((await response.json()).error?.message ?? "Não foi possível salvar o resumo."); return; }
    setError("");
    router.refresh();
  }

  async function updateStatus(nextStatus: "COMPLETED" | "CANCELLED") {
    const response = await fetch(`/api/v1/appointments/${appointmentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) { setError((await response.json()).error?.message ?? "Não foi possível atualizar a consulta."); return; }
    router.refresh();
  }

  return <form className="appointment-summary-form" onSubmit={save}><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Resumo privado do atendimento" aria-label="Resumo privado do atendimento" /><div><button type="submit" className="decision-button confirm">Salvar resumo</button>{status === "CONFIRMED" && <><button type="button" className="decision-button propose" onClick={() => void updateStatus("COMPLETED")}>Concluir consulta</button><button type="button" className="decision-button decline" onClick={() => void updateStatus("CANCELLED")}>Cancelar</button></>}</div>{error && <small className="auth-error">{error}</small>}</form>;
}
```

- [ ] **Step 4: Reestruturar a consulta da página e renderizar os quatro blocos**

Em `app/admin/agenda/page.tsx`, usar o mesmo escopo em todas as consultas:

```ts
const appointmentWhere = user.role === "ADMIN" ? {} : { therapistId: user.id };
const [pending, confirmed, completed, profiles] = await Promise.all([
  prisma.appointmentRequest.findMany({ where: { ...appointmentWhere, status: { in: [AppointmentRequestStatus.PENDING, AppointmentRequestStatus.PROPOSED] } }, include: { client: true, therapist: true }, orderBy: { desiredStart: "asc" } }),
  prisma.appointment.findMany({ where: { ...appointmentWhere, status: AppointmentStatus.CONFIRMED }, include: { client: true, therapist: true, summary: true }, orderBy: { startAt: "asc" } }),
  prisma.appointment.findMany({ where: { ...appointmentWhere, status: AppointmentStatus.COMPLETED }, include: { client: true, therapist: true, summary: true }, orderBy: { startAt: "desc" } }),
  prisma.therapistProfile.findMany({ where: user.role === "ADMIN" ? undefined : { userId: user.id }, include: { user: true, availabilities: { orderBy: { weekday: "asc" } } } }),
]);
```

Renderizar, nesta ordem, os seguintes blocos compactos:

```tsx
<div className="dashboard-grid">
  <article className="data-card"><span>Solicitações pendentes</span><strong>{pending.length}</strong></article>
  <article className="data-card"><span>Consultas confirmadas</span><strong>{confirmed.length}</strong></article>
  <article className="data-card"><span>Consultas concluídas</span><strong>{completed.length}</strong></article>
</div>
<section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Agenda</p><h2 className="display-font">Próximos atendimentos</h2></div></div>{confirmed.length ? confirmed.map((appointment) => <article className="appointment-row" key={appointment.id}><div><strong>{appointment.client.name}</strong><span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {(appointment.endAt.getTime() - appointment.startAt.getTime()) / 60000} min</span></div><AppointmentSummaryForm appointmentId={appointment.id} initialBody={appointment.summary?.body ?? ""} status="CONFIRMED" /></article>) : <div className="empty-state"><h3>Nenhum atendimento confirmado</h3><p>Consultas confirmadas aparecerão aqui.</p></div>}</section>
<section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2 className="display-font">Atendimentos concluídos</h2></div></div>{completed.length ? completed.map((appointment) => <article className="appointment-row" key={appointment.id}><div><strong>{appointment.client.name}</strong><span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span></div><AppointmentSummaryForm appointmentId={appointment.id} initialBody={appointment.summary?.body ?? ""} status="COMPLETED" /></article>) : <div className="empty-state"><h3>Nenhum atendimento concluído</h3><p>O histórico aparecerá aqui após concluir uma consulta.</p></div>}</section>
<section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Disponibilidades</p><h2 className="display-font">Janelas de atendimento</h2></div></div>{profiles.map((profile) => <div className="availability-block" key={profile.id}><strong>{profile.user.name}</strong><AvailabilityList therapistId={profile.userId} items={profile.availabilities} /><AvailabilityForm therapistId={profile.userId} /></div>)}</section>
<section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Solicitações</p><h2 className="display-font">Próximos pedidos</h2></div></div>{pending.length ? pending.map((request) => <article className="admin-request" key={request.id}><div><strong>{request.client.name}</strong><span>{request.therapist.name} · {request.desiredStart.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span><p>{request.message}</p></div><AppointmentDecisionForm requestId={request.id} /></article>) : <div className="empty-state"><h3>Nenhuma solicitação pendente</h3><p>Quando um cliente pedir um horário, ele aparecerá aqui.</p></div>}</section>
```

Cada item de consulta mostra cliente, profissional, início, fim e duração em minutos. Não incluir consultas `CANCELLED` na seção de notas.

- [ ] **Step 5: Adicionar apenas estilos de suporte responsivos**

Em `app/globals.css`, acrescentar estilos para manter controles legíveis sem criar um novo sistema visual:

```css
.appointment-row { display: grid; gap: 0.9rem; padding: 1.1rem 0; border-bottom: 1px solid var(--line); }
.appointment-row:last-child { border-bottom: 0; }
.appointment-summary-form { display: grid; gap: 0.55rem; max-width: 760px; }
.appointment-summary-form textarea { min-height: 7rem; resize: vertical; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); color: var(--ink); padding: 0.65rem; }
.appointment-summary-form > div, .availability-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
@media (max-width: 720px) { .appointment-row { gap: 0.7rem; } }
```

- [ ] **Step 6: Executar a verificação da agenda**

Run: `npx tsx --test tests/agenda-ui.test.ts && npm run lint`

Expected: PASS; o portal do cliente continua sem referência a notas.

- [ ] **Step 7: Commit**

```bash
git add app/admin/agenda/page.tsx components/appointment-summary-form.tsx app/globals.css tests/agenda-ui.test.ts
git commit -m "feat: add operational appointment agenda"
```

### Task 5: Criar detalhe administrativo de cliente com lembrete da próxima consulta

**Files:**
- Modify: `app/admin/clientes/page.tsx`
- Create: `app/admin/clientes/[id]/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/agenda-ui.test.ts`

**Interfaces:**
- Consumes: `Appointment.summary` e o mesmo escopo `therapistId` da agenda.
- Produces: rota administrativa `/admin/clientes/:id`, alcançável pela lista de clientes.

- [ ] **Step 1: Escrever o teste da rota de detalhe e do lembrete único**

Acrescentar a `tests/agenda-ui.test.ts`:

```ts
test("o detalhe administrativo do cliente possui lembrete único e histórico privado", async () => {
  const [clients, detail] = await Promise.all([
    readFile("app/admin/clientes/page.tsx", "utf8"),
    readFile("app/admin/clientes/[id]/page.tsx", "utf8"),
  ]);
  assert.match(clients, /href=\{`\/admin\/clientes\/\$\{client\.id\}`\}/);
  assert.match(detail, /Próxima consulta/);
  assert.match(detail, /take: 1/);
  assert.match(detail, /summary/);
});
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npx tsx --test tests/agenda-ui.test.ts`

Expected: FAIL porque a página de detalhe ainda não existe.

- [ ] **Step 3: Ligar a lista ao detalhe autorizado**

Atualizar `app/admin/clientes/page.tsx` para derivar o escopo antes da busca e envolver cada linha em `Link`:

```tsx
const user = await requireRole(["ADMIN", "THERAPIST"]);
const clients = await prisma.user.findMany({
  where: user.role === "ADMIN" ? { role: "CLIENT" } : { role: "CLIENT", clientAppointments: { some: { therapistId: user.id } } },
  include: { _count: { select: { clientRequests: true, clientAppointments: true } } },
  orderBy: { name: "asc" },
});

<Link className="list-row" href={`/admin/clientes/${client.id}`} key={client.id}>
  {/* conteúdo atual do cliente */}
</Link>
```

- [ ] **Step 4: Criar a página de detalhe com regra de acesso e consulta mínima**

Criar `app/admin/clientes/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const { id } = await params;
  const client = await prisma.user.findFirst({
    where: user.role === "ADMIN" ? { id, role: "CLIENT" } : { id, role: "CLIENT", clientAppointments: { some: { therapistId: user.id } } },
    select: { id: true, name: true, email: true },
  });
  if (!client) notFound();

  const appointmentScope = user.role === "ADMIN" ? { clientId: client.id } : { clientId: client.id, therapistId: user.id };
  const [nextAppointment, appointments] = await Promise.all([
    prisma.appointment.findFirst({ where: { ...appointmentScope, status: "CONFIRMED", startAt: { gte: new Date() } }, include: { therapist: { select: { name: true } } }, orderBy: { startAt: "asc" } }),
    prisma.appointment.findMany({ where: { ...appointmentScope, status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED"] } }, include: { therapist: { select: { name: true } }, summary: { include: { author: { select: { name: true } } } } }, orderBy: { startAt: "desc" } }),
  ]);

  return <div><Link href="/admin/clientes">Voltar para clientes</Link><div className="portal-heading"><div><p className="eyebrow">Cliente</p><h1 className="display-font">{client.name}</h1><p>{client.email}</p></div></div><section className="portal-panel next-appointment-card"><p className="eyebrow">Lembrete</p><h2 className="display-font">Próxima consulta</h2>{nextAppointment ? <p>{nextAppointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {nextAppointment.therapist.name}</p> : <p>Nenhuma consulta confirmada futura.</p>}</section><section className="portal-panel"><p className="eyebrow">Histórico</p><h2 className="display-font">Atendimentos</h2>{appointments.length ? appointments.map((appointment) => <article className="appointment-row" key={appointment.id}><div><strong>{appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</strong><span>{appointment.therapist.name} · {appointment.status}</span></div>{appointment.summary && <div className="client-history-note"><strong>Resumo privado</strong><p>{appointment.summary.body}</p><small>Atualizado em {appointment.summary.updatedAt.toLocaleDateString("pt-BR")} por {appointment.summary.author.name}</small></div>}</article>) : <div className="empty-state"><h3>Nenhum atendimento registrado</h3><p>Consultas deste cliente aparecerão aqui.</p></div>}</section></div>;
}
```

O histórico é somente leitura: não renderizar `AppointmentSummaryForm` no detalhe. Exibir a nota apenas quando `summary` existir, com data da atualização e nome de `summary.author`.

- [ ] **Step 5: Ajustar o estilo do lembrete e executar o teste**

Adicionar em `app/globals.css`:

```css
.next-appointment-card { max-width: 48rem; }
.client-history-note { margin-top: 0.65rem; padding: 0.8rem; border-left: 2px solid var(--gold); background: var(--paper-deep); color: var(--muted); white-space: pre-wrap; }
```

Aplicar `next-appointment-card` ao cartão de lembrete e `client-history-note` ao conteúdo da nota.

Run: `npx tsx --test tests/agenda-ui.test.ts && npm run lint`

Expected: PASS; a lista aponta para o detalhe e o lembrete usa somente a primeira consulta futura confirmada.

- [ ] **Step 6: Commit**

```bash
git add app/admin/clientes/page.tsx app/admin/clientes/[id]/page.tsx app/globals.css tests/agenda-ui.test.ts
git commit -m "feat: add private client appointment history"
```

### Task 6: Verificar todos os perfis, a migração e o build de produção

**Files:**
- Modify: `tests/appointment-summary.test.ts` somente se a execução revelar um caso de isolamento não coberto.

**Interfaces:**
- Consumes: todas as rotas, componentes e modelo das Tasks 1 a 5.
- Produces: validação final reproduzível da agenda para Teka, Admin e cliente.

- [ ] **Step 1: Executar toda a suíte automatizada**

Run: `npm test`

Expected: PASS para todos os testes existentes e os novos testes de resumo, disponibilidade e interface da agenda.

- [ ] **Step 2: Executar tipos e build de produção**

Run: `npm run lint && npm run build`

Expected: ambos encerram com código 0; o build lista as rotas dinâmicas de `admin/clientes/[id]` e `api/v1/appointments/[id]`.

- [ ] **Step 3: Fazer a checagem manual com sessões isoladas**

Run: `npm run dev`

Expected: servidor em execução local. Conferir, em perfis/sessões separados:

1. Teka abre `/admin/agenda`, edita e exclui apenas as próprias disponibilidades, confirma um pedido, registra nota e conclui a consulta.
2. Admin abre a mesma rota, visualiza agendas e notas de todas as profissionais, e abre o detalhe de qualquer cliente.
3. Outro usuário `THERAPIST` não encontra consulta, disponibilidade nem cliente da Teka por URL ou endpoint.
4. Cliente abre `/portal/consultas` e vê somente a consulta e seu estado, sem nota, indicador de nota ou link administrativo.
5. Em `/admin/clientes/:id`, o cartão superior mostra somente a consulta confirmada futura mais próxima; sem próxima consulta, mostra o estado vazio definido.

- [ ] **Step 4: Revisar o diff final**

Run: `git diff --check && git status --short`

Expected: nenhum erro de espaço em branco; somente arquivos intencionais rastreados ou já conhecidos no status.

- [ ] **Step 5: Commit de correções finais, se houver**

```bash
git add tests/appointment-summary.test.ts
git commit -m "test: cover agenda access boundaries"
```

Executar este commit apenas se o Step 1 revelar uma lacuna e o teste for realmente alterado; caso contrário, não criar commit vazio.

## Revisão de cobertura do plano

- Agenda com solicitações, confirmadas e concluídas: Tasks 2 e 4.
- Conclusão, histórico e cancelamento de uma consulta confirmada: Task 2 e Task 4.
- Resumo uma-para-um, privado, com autoria preservada: Tasks 1 e 2.
- Edição e exclusão de disponibilidade: Task 3.
- Restrições de Teka, Admin e cliente: Tasks 2, 4, 5 e 6.
- Histórico por cliente e lembrete da próxima consulta confirmada: Task 5.
- Sigilo do cliente e regressão de portal: Tasks 4, 5 e 6.
