# Deploy no Railway

## Topologia

O projeto usa dois serviços no Railway:

- `web`: um único serviço Next.js com homepage, portal, área administrativa, rotas `/api`, Prisma e chamadas HTTPS externas.
- `Postgres`: o serviço PostgreSQL já criado e vinculado ao `web` pelas variáveis do Railway.

Não crie serviços separados para frontend e backend e não use `Root Directory` para separar camadas. O frontend e o backend vivem no mesmo App Router.

Domínio público atual: `https://tekaneves.up.railway.app`.

O Railway informa a porta pública `8080`. O Next.js respeita a variável `PORT` fornecida pelo Railway; não fixe outra porta no código.

## Variáveis

No serviço `web`, confirme no painel Variables:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
SEED_PASSWORD=<senha forte para o seed administrativo>
NODE_ENV=production
```

Use o nome real do serviço Postgres caso ele não seja literalmente `Postgres`. Não copie a URL pública `tokaido.proxy.rlwy.net:24653` para o repositório e não publique senha, usuário ou token. A referência automática do painel é a configuração correta para comunicação entre serviços.

O endereço privado `psi-teka-neves.railway.internal` é reservado para comunicação interna entre serviços Railway. O navegador dos usuários deve acessar o domínio público.

## Primeiro deploy

Execute na raiz do projeto, no terminal em que o Railway estiver autenticado:

```powershell
railway login
railway status
railway variables
railway up
```

O `railway up` envia o código respeitando `.gitignore`, o Railway executa o build `prisma generate && next build` e o processo de start executa `prisma migrate deploy && next start`.

Se o projeto já estiver autenticado e vinculado, o comando principal é somente:

```powershell
railway up
```

## Acompanhar e testar

```powershell
railway logs
railway deployment list
Invoke-WebRequest -Uri 'https://tekaneves.up.railway.app/' -UseBasicParsing
Invoke-WebRequest -Uri 'https://tekaneves.up.railway.app/entrar' -UseBasicParsing
```

Depois do primeiro deploy:

1. Abra `/entrar` e confirme o login administrativo.
2. Abra `/admin` e configure o card de frases.
3. Ative o card e o modo automático para testar DummyJSON e MyMemory.
4. Confirme que a frase manual continua sendo exibida se alguma API externa falhar.

## APIs externas

As requisições são feitas pelo servidor do serviço `web` e não pelo navegador:

- Frases: `https://dummyjson.com/quotes/random`
- Tradução: `https://api.mymemory.translated.net/get`

Não é necessário configurar CORS ou expor essas URLs ao cliente. O serviço Railway precisa apenas ter saída HTTPS para esses domínios. O cache da frase automática dura uma hora por instância e a configuração manual permanece como fallback.

## Banco PostgreSQL

Para o banco local, configure um PostgreSQL separado em `localhost:5432/teka_dev` e execute:

```powershell
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
```

Para aplicar migrations no banco do serviço vinculado, use o processo do deploy ou, após autenticar o CLI:

```powershell
railway run npm run db:migrate:deploy
railway run npm run db:seed
```

Execute `db:seed` no Railway somente quando quiser criar ou atualizar as contas administrativas do ambiente. O `SEED_PASSWORD` deve estar configurado antes desse comando.
