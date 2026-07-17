# Área de Login, Agenda e Contato do Paciente

## Objetivo

Adicionar uma primeira área autenticada ao website Teka Neves, isolada em uma worktree, para permitir cadastro e login de clientes, solicitação de consultas, gestão de agenda pelo admin e contato assíncrono relacionado ao atendimento.

## Escopo

- Worktree `user-login` na branch `feature/user-login-portal`.
- SQLite local com Prisma.
- Cadastro e login por email e senha.
- Sessão persistente por cookie `httpOnly` e expiração.
- Papéis `ADMIN`, `THERAPIST` e `CLIENT`.
- Portal do cliente com resumo, solicitação de agendamento, consultas e contato.
- Área administrativa com agenda, disponibilidades, clientes e decisões sobre solicitações.
- Mensagens assíncronas vinculadas a solicitações ou consultas.
- Homepage pública preservada.

Ficam fora desta etapa: OAuth, recuperação de senha por email, videochamada, pagamento, notificações externas, chat em tempo real, múltiplos fusos por usuário e deploy externo.

## Experiência e rotas

Rotas públicas:

- `/entrar`
- `/cadastro`

Rotas do cliente:

- `/portal`
- `/portal/agendar`
- `/portal/consultas`
- `/portal/contato`

Rotas administrativas:

- `/admin`
- `/admin/agenda`
- `/admin/clientes`

Clientes solicitam um horário disponível, informam uma mensagem breve e acompanham o status. O admin visualiza a agenda, configura disponibilidades, confirma, recusa ou propõe outro horário. O contato online é uma caixa assíncrona de mensagens vinculada à solicitação ou consulta, sem conversa contínua durante a sessão.

## Dados

Entidades Prisma:

- `User`: identidade, email, nome, senha derivada e papel.
- `Session`: token derivado, usuário, expiração e revogação.
- `TherapistProfile`: apresentação e dados profissionais vinculados ao usuário terapeuta.
- `Availability`: dia da semana, horário inicial e final, ativo e terapeuta.
- `AppointmentRequest`: cliente, terapeuta, data desejada, duração, mensagem e status.
- `Appointment`: solicitação aprovada, cliente, terapeuta, início, fim, status e observações administrativas.
- `ContactMessage`: remetente, destinatário, vínculo opcional com solicitação ou consulta, conteúdo, leitura e timestamps.

Índices essenciais:

- email único em `User`;
- token único em `Session`;
- busca de sessões por usuário e expiração;
- agenda por terapeuta, início e status;
- solicitações por cliente e status;
- mensagens por conversa de atendimento e data de criação.

## Segurança

- Senhas armazenadas somente como hash.
- Cookie de sessão `httpOnly`, `sameSite=lax` e `secure` em produção.
- Verificação de papel em cada rota protegida e mutation server-side.
- Cliente só acessa suas próprias consultas, solicitações e mensagens.
- Admin acessa agenda e clientes conforme seu papel.
- Validação de entrada no servidor para email, datas, horários e conteúdo.
- Erros retornam mensagens seguras, sem expor stack trace ou dados internos.

## API interna

Usar endpoints REST sob `/api/v1` com respostas consistentes:

```json
{ "data": {}, "error": null }
```

ou:

```json
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Dados inválidos" } }
```

Endpoints iniciais:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/session`
- `GET /api/v1/availability`
- `POST /api/v1/appointment-requests`
- `GET /api/v1/appointments`
- `PATCH /api/v1/appointment-requests/:id`
- `GET /api/v1/contact-messages`
- `POST /api/v1/contact-messages`

## Estados e erros

- Campos inválidos permanecem preenchidos e exibem erros associados.
- Email já cadastrado informa conflito sem revelar dados extras.
- Login inválido usa mensagem genérica.
- Rota sem sessão redireciona para `/entrar`.
- Papel sem permissão recebe `403`.
- Horário indisponível impede a solicitação e pede nova seleção.
- Lista vazia tem estado orientativo para primeira consulta, nenhuma mensagem e agenda sem horários.

## Verificação

- Migrar o schema Prisma para SQLite local.
- Criar usuário admin local de desenvolvimento por seed.
- Testar cadastro, login, logout e proteção de rotas.
- Testar solicitação de horário e decisão administrativa.
- Testar isolamento de dados entre dois clientes.
- Testar criação e leitura de mensagem assíncrona.
- Rodar TypeScript, build e smoke test HTTP em localhost.
