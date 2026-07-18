# Agenda funcional e notas privadas de atendimento

## Objetivo

Transformar a área de agenda da Teka em uma visão operacional: disponibilidades editáveis, consultas em ordem cronológica, histórico de atendimentos e notas de resumo privadas para cada atendimento confirmado ou concluído.

## Escopo aprovado

- Mostrar a agenda da psicanalista com solicitações, consultas confirmadas e consultas concluídas.
- Manter toda a operação de agenda concentrada em `/admin/agenda`.
- Permitir editar e excluir disponibilidades já registradas, além de criar novas.
- Restringir a agenda da Teka ao próprio perfil; o Admin master mantém visão geral de todas as agendas.
- Criar uma nota clínica/resumo por atendimento confirmado ou concluído.
- Permitir visualizar e editar essas notas apenas para a psicanalista relacionada ao atendimento ou para o Admin master.
- Não incluir notas, nem seus indicadores, nas rotas ou telas do cliente.
- Criar, no submenu administrativo de Clientes, um detalhe por cliente com histórico de atendimentos e notas privadas autorizadas.
- Preservar solicitações, confirmação, cancelamento, disponibilidade e mensagens existentes.

Fora de escopo: prontuário completo, anexos, diagnóstico, prescrições, exportação, notificações em tempo real, recorrência automática e integração de calendário externo.

## Estrutura da agenda

### Página `/admin/agenda`

1. **Resumo da agenda** — totais curtos para solicitações pendentes, consultas confirmadas e concluídas.
2. **Próximos atendimentos** — consultas confirmadas, por data crescente, com cliente, horário, duração e atalho para a nota privada.
3. **Histórico** — consultas concluídas, por data decrescente, com acesso à nota de resumo.
4. **Disponibilidades** — cada janela mostra dia, início e fim, com ações editar e excluir; o formulário de criação continua no mesmo painel.
5. **Solicitações** — mantém as decisões de confirmar, propor outro horário ou recusar.

Em perfil `THERAPIST`, todas as consultas, disponibilidades e notas ficam restritas ao `therapistId` da sessão. Em perfil `ADMIN`, as informações continuam visíveis para gestão e podem ser filtradas por profissional quando houver mais de uma.

### Clientes (`/admin/clientes`)

- A lista de clientes passa a ter um link de detalhe para `/admin/clientes/[id]`.
- No topo do detalhe, um único card de lembrete mostra a próxima consulta confirmada do cliente, com data, horário e profissional; quando não houver consulta futura, mostra um estado vazio curto.
- A página de detalhe mostra os dados básicos do cliente, suas consultas confirmadas/concluídas/canceladas em ordem cronológica e, para cada consulta com nota, o resumo privado de atendimento.
- O detalhe reutiliza as mesmas regras de acesso: Teka só vê clientes vinculados a seus próprios atendimentos; Admin pode ver todos.
- O cliente não recebe link, rota, indicador ou resposta de API que revele a existência dessas notas.

## Dados e acesso

Criar o modelo `AppointmentSummary` com uma relação um-para-um a `Appointment`:

```prisma
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

Adicionar as relações inversas necessárias em `User` e `Appointment`.

O endpoint de nota deve validar corpo entre 1 e 4.000 caracteres, exigir sessão e verificar que:

- `THERAPIST` só acessa consulta cujo `therapistId` é o próprio usuário;
- `ADMIN` pode acessar qualquer consulta;
- a consulta está `CONFIRMED` ou `COMPLETED`;
- `CLIENT` recebe 403 e não recebe metadados, contagem ou conteúdo de nota.

Usar upsert para manter uma única nota por atendimento. A autoria é a pessoa que criou a nota; alterações posteriores pelo Admin preservam a mesma nota e atualizam `updatedAt`.

## API e componentes

- `PATCH` e `DELETE /api/v1/availability/admin/[id]` para alterar ou remover uma janela, aplicando a mesma autorização da criação.
- `PUT /api/v1/appointments/[id]/summary` para criar/atualizar resumo privado e `GET` equivalente para leitura autorizada.
- `AvailabilityForm` ganha modo de edição; `AvailabilityList` ou componente equivalente apresenta ações por janela.
- `AppointmentSummaryForm` é um componente cliente com feedback local e atualização de rota após salvar.
- A página da agenda busca consultas e resumos no servidor; a nota é aberta na própria página, sem uma rota pública adicional.
- Criar `app/admin/clientes/[id]/page.tsx` para o histórico administrativo do cliente; o resumo é apresentado em leitura nessa tela e continua editável exclusivamente pela agenda.

## Histórico e estados

- Quando uma consulta passa a `COMPLETED`, ela sai de “Próximos atendimentos” e entra em “Histórico”.
- Uma nota pode ser iniciada em atendimento confirmado e editada após a conclusão.
- Canceladas não recebem nota de resumo.
- Excluir disponibilidade não altera consultas já confirmadas; apenas remove a janela futura configurada.

## Verificação

- Testes de autorização: cliente não consegue ler/gravar resumo; terapeuta não acessa consulta de outra terapeuta; Admin pode acessar.
- Testes de estado: notas aceitam apenas consultas `CONFIRMED`/`COMPLETED`; única nota por atendimento; upsert atualiza conteúdo.
- Testes de disponibilidade: terapeuta atualiza/remove só a própria janela; Admin pode administrar; intervalo inválido é rejeitado.
- `npm test`, `npm run lint` e `npm run build` passam.
- Conferência manual em perfis isolados: Teka vê e edita sua agenda/nota; Admin vê gestão; cliente vê somente suas consultas, sem notas.
- Conferir o detalhe de cliente: Teka vê somente histórico de clientes próprios; Admin vê qualquer cliente; o cliente não acessa a rota administrativa.
- Conferir o lembrete de próxima consulta: mostra apenas a consulta confirmada futura mais próxima e não mostra nota clínica.

## Critérios de aceite

- Teka consegue ver agenda, histórico e disponibilidades em uma tela útil.
- Disponibilidades podem ser adicionadas, editadas e removidas.
- Cada atendimento confirmado ou concluído aceita uma nota privada de resumo.
- O submenu Clientes permite abrir o histórico individual e ler os resumos privados autorizados.
- O detalhe de cliente mostra apenas um lembrete objetivo da próxima consulta confirmada.
- Notas não são retornadas, renderizadas nem indicadas para o cliente.
- Admin master mantém acesso de gestão, sem ampliar a visibilidade entre clientes.
