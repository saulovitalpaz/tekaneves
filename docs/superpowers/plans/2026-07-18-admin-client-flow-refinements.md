# Admin Client Flow Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar conversas por cliente, inserção manual de agenda com pré-cadastro vinculável, aceite/recusa de proposta pelo cliente, autocadastro visível no login e homepage sem mock-data.

**Architecture:** Manter Next.js App Router com server components para leitura e componentes client para formulários. Pré-cadastros entram em tabelas próprias para evitar usuários falsos; vinculação posterior cria os registros reais de solicitação/consulta. APIs novas ficam sob `/api/v1/admin/*` e a decisão do cliente reaproveita `/api/v1/appointment-requests/[id]` com escopo por `clientId`.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 6, SQLite, TypeScript, node:test.

## Global Constraints

- Não criar usuário falso para pré-cadastro.
- Agenda real com cliente cadastrado deve manter `AppointmentRequest` e `Appointment` vinculados por `clientId`.
- Conversa admin/terapeuta deve mostrar mensagens enviadas e recebidas.
- Recusa de proposta pelo cliente deve abrir comunicação vinculada à solicitação.
- Homepage não deve exibir texto de desenvolvimento/mock.

---

### Task 1: Testes RED

**Files:**
- Modify: `tests/admin-messaging-recipients.test.ts`
- Modify: `tests/agenda-ui.test.ts`
- Modify: `tests/homepage-content.test.ts`
- Create: `tests/admin-appointment-insertion.test.ts`
- Create: `tests/client-proposal-actions.test.ts`
- Create: `tests/auth-entry.test.ts`

**Interfaces:**
- Consumes: código atual.
- Produces: testes falhando para conversas, agenda manual, pré-cadastro, proposta cliente, login e homepage.

- [ ] Escrever testes estáticos e comportamentais mínimos.
- [ ] Rodar testes focados e confirmar falha pelo motivo esperado.

### Task 2: Banco e helpers de agenda manual

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260718130000_add_pre_registered_appointments/migration.sql`
- Create: `lib/admin-appointments.ts`
- Modify: `lib/validation.ts`

**Interfaces:**
- Produces: `createRegisteredAppointment(input)`, `createPreRegisteredAppointment(input)`, `linkPreRegistrationToClient(input)`.

- [ ] Adicionar modelos `PreRegistration` e `PreRegisteredAppointment`.
- [ ] Adicionar schemas de criação/vinculação.
- [ ] Implementar helpers transacionais.
- [ ] Gerar Prisma client e validar testes focados.

### Task 3: APIs e UI de agenda

**Files:**
- Create: `app/api/v1/admin/appointments/route.ts`
- Create: `app/api/v1/admin/pre-registrations/[id]/link/route.ts`
- Create: `components/admin-appointment-form.tsx`
- Create: `components/pre-registration-link-form.tsx`
- Modify: `app/admin/agenda/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: helpers de `lib/admin-appointments.ts`.
- Produces: formulário "Inserir na agenda" e vínculo de pré-cadastro.

- [ ] Criar endpoints administrativos com `requireRole(["ADMIN", "THERAPIST"])`.
- [ ] Renderizar formulário em `/admin/agenda`.
- [ ] Remover `quick-links` de `/admin`.
- [ ] Exibir pré-cadastros pendentes com seletor de cliente.

### Task 4: Conversas por paciente

**Files:**
- Modify: `lib/internal-messages.ts`
- Modify: `app/admin/mensagens/page.tsx`
- Modify: `components/message-list.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `listInternalConversation(currentUserId, partnerId)` e UI com conversa selecionada.

- [ ] Buscar mensagens onde usuário atual enviou ou recebeu do cliente selecionado.
- [ ] Trocar histórico linear por conversa.
- [ ] Manter envio ao paciente selecionado.

### Task 5: Proposta no portal cliente

**Files:**
- Create: `components/appointment-proposal-actions.tsx`
- Modify: `app/portal/consultas/page.tsx`
- Modify: `app/api/v1/appointment-requests/[id]/route.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `ContactRequestForm`/endpoint de mensagens e PATCH de appointment request.
- Produces: aceitar ou recusar proposta com mensagem modal.

- [ ] Permitir cliente confirmar/recusar somente sua própria proposta.
- [ ] Renderizar botões para `PROPOSED`.
- [ ] Enviar mensagem vinculada antes da recusa.

### Task 6: Login e homepage

**Files:**
- Modify: `app/entrar/page.tsx`
- Modify: `components/home-entry.tsx`
- Modify: `lib/content.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: autocadastro visível no login e homepage sem mock-data.

- [ ] Incluir formulário/CTA explícito de autocadastro em `/entrar`.
- [ ] Remover texto de desenvolvimento do conteúdo público.
- [ ] Integrar título "Teka Neves" à imagem de perfil.

### Task 7: Verificação e commit

**Files:**
- All touched files.

- [ ] Rodar `npm test`.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run build`.
- [ ] Rodar `git diff --check`.
- [ ] Commitar somente arquivos do escopo.
