# Ajustes de fluxo admin, terapeuta, cliente e homepage

Data: 2026-07-18

## Objetivo

Melhorar os fluxos operacionais sem misturar responsabilidades: conversa por paciente para terapeuta/admin, inserção manual de agenda com pré-cadastro vinculável, decisões reais de horário proposto no portal cliente, autocadastro visível no login e homepage pública sem textos mock.

## Decisões

- Mensagens admin/terapeuta passam a ser exibidas por conversa com cliente, mostrando mensagens recebidas e enviadas em ordem cronológica.
- O painel `/admin` deixa de exibir cards de atalho para subpáginas, já cobertas pelo menu superior.
- A função "Inserir na agenda" fica em `/admin/agenda` e permite dois modos:
  - cliente cadastrado: cria solicitação confirmada e consulta real vinculada ao `User`;
  - pré-cadastro: cria um pré-cadastro e um atendimento provisório, sem criar usuário falso.
- Pré-cadastros podem ser vinculados depois a um cliente real pesquisado no DB; ao vincular, o sistema cria a consulta real correspondente e preserva o rastro do registro provisório.
- Clientes podem aceitar ou recusar horário proposto em `/portal/consultas`.
- Recusar horário proposto abre um card sobreposto com mensagem vinculada à solicitação antes de marcar a proposta como recusada.
- `/entrar` exibe função explícita de autocadastro de cliente no mesmo card.
- Homepage pública remove textos de desenvolvimento/mock e mantém somente apresentação de Teka Neves como psicanalista, com o título integrado à imagem de perfil.

## Banco de dados

Adicionar tabelas normalizadas:

- `PreRegistration`: dados mínimos de pessoa ainda não vinculada a `User`.
- `PreRegisteredAppointment`: atendimento provisório associado ao pré-cadastro, terapeuta e usuário criador.

Relações opcionais permitem vincular depois `PreRegistration.linkedUserId` e `PreRegisteredAppointment.linkedAppointmentId` sem perda de histórico.

