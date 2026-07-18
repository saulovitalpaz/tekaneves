# Teka Neves | Website

Homepage pública de psicoterapia, construída para desenvolvimento local em Next.js.

## Rodar em localhost

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Verificações

```bash
npm run lint
npm run build
```

O formulário de contato é somente uma prévia local. Ele não envia dados e não usa banco ou serviço externo.

## Worktree de login e portal

Esta branch adiciona uma área autenticada local em SQLite + Prisma.

```bash
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Contas locais de desenvolvimento, todas com a senha definida em `SEED_PASSWORD`:

- `admin@teka.local` para `/admin`;
- `terapeuta@teka.local` para agenda de terapeuta;
- `cliente@teka.local` para `/portal`.

O comando `npm run db:seed` cria ou atualiza as três contas. Todas usam a senha definida em `SEED_PASSWORD`, e `terapeuta@teka.local` é a conta usada para revisar solicitações e salvar disponibilidade na agenda.

Rotas adicionadas:

- `/entrar` e `/cadastro`;
- `/portal`, `/portal/agendar`, `/portal/consultas` e `/portal/contato`;
- `/admin`, `/admin/agenda`, `/admin/clientes` e `/admin/mensagens`.

O contato é assíncrono e orientado ao agendamento. Não há websocket, videochamada, email, pagamento ou serviço externo nesta fase.

## Estrutura para evolução

- `app/page.tsx`: composição da homepage pública.
- `components/`: blocos visuais e formulário local.
- `lib/content.ts`: conteúdo editável da homepage.
- `lib/daily-phrases.ts`: módulo legado/dormente de frases rotativas, não composto na homepage atual.
- `public/images/profile.jpeg`: retrato utilizado na página.
- Futuras áreas de paciente podem ser adicionadas em grupos de rotas para login, dashboard, agendamento e histórico, sem misturar regras autenticadas com a homepage.
