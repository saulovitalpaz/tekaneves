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

## Estrutura para evolução

- `app/page.tsx`: composição da homepage pública.
- `components/`: blocos visuais e formulário local.
- `lib/content.ts`: conteúdo editável da homepage.
- `lib/daily-phrases.ts`: fonte local temporária das frases rotativas. No futuro, pode ser substituída por uma API protegida pelo painel admin.
- `public/images/profile.jpeg`: retrato utilizado na página.
- Futuras áreas de paciente podem ser adicionadas em grupos de rotas para login, dashboard, agendamento e histórico, sem misturar regras autenticadas com a homepage.
