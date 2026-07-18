# Teka Neves | Website

Homepage pública de psicoterapia, construída em Next.js para desenvolvimento local e deploy no Railway.

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
npm test
```

O formulário de contato grava inquiries no PostgreSQL. A homepage pode buscar frases no DummyJSON e traduzi-las para português pelo MyMemory, com cache de uma hora e fallback para a frase manual.

## Banco local e produção

Local e produção usam PostgreSQL com a mesma cadeia de migrations Prisma. O banco SQLite antigo foi removido; não use o banco de produção para testes locais.

```bash
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

O `.env.example` espera um PostgreSQL local em `localhost:5432/teka_dev`. Para o Railway, configure `DATABASE_URL` como referência ao serviço Postgres e use `railway up`. O comando `npm run start` aplica migrations pendentes antes de iniciar o Next.js.

Consulte [docs/deploy/railway.md](docs/deploy/railway.md) para o fluxo de publicação.

## Área autenticada

Contas locais de desenvolvimento, todas com a senha definida em `SEED_PASSWORD`:

- `admin@teka.local` para `/admin`;
- `terapeuta@teka.local` para agenda de terapeuta;
- `cliente@teka.local` para `/portal`.

O comando `npm run db:seed` cria ou atualiza as três contas. Todas usam a senha definida em `SEED_PASSWORD`, e `terapeuta@teka.local` é a conta usada para revisar solicitações e salvar disponibilidade na agenda.

Rotas adicionadas:

- `/entrar` e `/cadastro`;
- `/portal`, `/portal/agendar`, `/portal/consultas` e `/portal/contato`;
- `/admin`, `/admin/agenda`, `/admin/clientes` e `/admin/mensagens`.

O contato é assíncrono e orientado ao agendamento. Não há websocket, videochamada, email ou pagamento nesta fase.

## Estrutura para evolução

- `app/page.tsx`: composição da homepage pública.
- `components/`: blocos visuais e formulário local.
- `lib/content.ts`: conteúdo editável da homepage.
- `lib/homepage-quote.ts`: configurações, cache e integração server-side de frases da homepage.
- `public/images/profile.jpeg`: retrato utilizado na página.
- Futuras áreas de paciente podem ser adicionadas em grupos de rotas para login, dashboard, agendamento e histórico, sem misturar regras autenticadas com a homepage.
