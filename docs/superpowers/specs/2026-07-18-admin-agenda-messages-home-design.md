# Ajustes de agenda, mensagens e homepage

Data: 2026-07-18

## Objetivo

Separar responsabilidades da área administrativa e reduzir redundância visual da homepage.

## Decisões

- `/admin/agenda` fica somente operacional: próximos atendimentos confirmados, solicitações, histórico e horários disponíveis.
- Resumos privados saem da agenda e entram em um novo submenu `/admin/resumos`.
- `/admin/resumos` lista consultas confirmadas no escopo do usuário logado e usa o `appointmentId` para salvar o resumo, preservando o vínculo com `Appointment.clientId`.
- `/admin/mensagens` passa a ter seletor de destinatário com todos os clientes autocadastrados, em vez de responder automaticamente ao primeiro remetente da inbox.
- Cards de leads da homepage deixam de ocupar largura excessiva e passam a se ajustar ao conteúdo, mantendo limite máximo para textos longos.
- Homepage pública fica como um hero inicial único, sem bloco lateral redundante de contato, com foto de perfil menor e mesclada ao fundo clean verde.

## Testes planejados

- Teste estático para garantir que a agenda não importa nem renderiza `AppointmentSummaryForm`.
- Teste estático para garantir existência do submenu `/admin/resumos` com consultas confirmadas e formulário de resumo.
- Teste de dados para garantir que clientes autocadastrados aparecem como destinatários para terapeuta.
- Teste estático para garantir seletor de destinatário em mensagens.
- Teste estático de CSS para hero inicial mais sutil e cards de leads compactos.
