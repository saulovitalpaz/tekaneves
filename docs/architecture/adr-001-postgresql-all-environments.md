# ADR-001: PostgreSQL em todos os ambientes

## Status

Accepted

## Contexto

O beta é uma aplicação Next.js full-stack: a mesma aplicação entrega a homepage, as rotas autenticadas e os endpoints `/api`. O banco local anterior era SQLite, mas o deploy no Railway precisa de armazenamento persistente e compatível com reinícios e novos deployments. O banco PostgreSQL do Railway já foi criado e vinculado ao serviço da aplicação.

## Opções consideradas

| Opção | Vantagens | Custos e riscos |
|---|---|---|
| PostgreSQL em local e Railway | Mesmo provider, mesma cadeia de migrations e testes mais próximos de produção | Exige PostgreSQL local ou uma rotina explícita de banco de desenvolvimento |
| SQLite local e PostgreSQL no Railway | Configuração local simples | Dois providers, migrations incompatíveis e maior risco de descobrir diferenças apenas no deploy |
| Frontend e backend como serviços separados | Escala independente | Duplica configuração, autenticação, deploy e comunicação sem necessidade nesta arquitetura |

## Decisão

Usar PostgreSQL em todos os ambientes e manter um único serviço `web` no Railway para o Next.js completo. O serviço PostgreSQL fica separado como recurso gerenciado e fornece `DATABASE_URL` ao serviço web por referência de variável no Railway.

As chamadas externas de frases e tradução permanecem no servidor da aplicação. O código usa DummyJSON para buscar a frase, MyMemory para traduzi-la para português e mantém cache de uma hora com fallback manual.

## Consequências

- As migrations Prisma serão PostgreSQL e poderão ser executadas localmente e no Railway com o mesmo comando.
- O banco SQLite local antigo poderá ser removido sem migração de dados, pois o banco PostgreSQL do Railway é novo.
- O desenvolvimento local exigirá uma instância PostgreSQL separada do banco de produção.
- O deploy será feito com `railway up`; o processo de inicialização aplicará `prisma migrate deploy` antes de iniciar o Next.js.
- O `Root Directory` não será usado para separar frontend e backend, pois não existem projetos independentes neste repositório.

## Reavaliação

Reavaliar esta decisão somente se o projeto passar a exigir múltiplos serviços independentes, distribuição global com baixa latência ou um volume de dados que justifique uma arquitetura diferente.
