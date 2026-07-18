# Landing pública mínima e contatos de origem homepage

## Objetivo

Transformar o site público em uma landing de entrada curta, séria e profissional, com o retrato da psicanalista em destaque. A navegação pública deve expor somente destinos úteis no contexto atual: contato e área do paciente. Mensagens originadas no site devem chegar ao painel da Teka sem se misturar às conversas autenticadas do portal.

## Escopo aprovado

- Usar “Psicanalista” como a descrição profissional pública.
- Reduzir a homepage a um card principal de entrada, um card complementar e rodapé compacto.
- Manter `public/images/profile.jpeg` visível no card principal, com enquadramento seguro e carregamento prioritário.
- Remover da homepage e do menu as seções superficiais de acompanhamento, para quem é e sobre.
- Manter somente `/contato` e `/entrar` como destinos públicos do menu; o logotipo leva para `/`.
- Manter um botão flutuante que abre uma janela de mensagem curta e ágil.
- Criar uma caixa de entrada pública, `HomepageInquiry`, separada das mensagens autenticadas de paciente.
- Permitir que `/contato` registre uma mensagem detalhada para retorno interno ou para continuação no WhatsApp.
- Usar o número de WhatsApp configurado para a profissional: `5533987009784`.
- Preservar agenda, autenticação, portal e painel administrativo existentes, exceto pelo acréscimo da visualização das mensagens públicas.

Fora de escopo: chat em tempo real, envio automático de resposta, integração com API do WhatsApp, envio de e-mail, pagamentos, mudanças nas regras de agenda ou alteração no fluxo das mensagens de pacientes.

## Arquitetura de informação

### Homepage (`/`)

1. **Cabeçalho compacto** — marca Teka Neves, descrição “Psicanalista”, links “Contato” e “Área do paciente”.
2. **Card principal** — foto, nome, frase de acolhimento e CTAs para `/contato` e `/entrar`. A página deve ter altura controlada, próxima de uma viewport em desktop.
3. **Card complementar** — uma única mensagem breve que reforça o convite ao contato; sem blocos editoriais adicionais.
4. **Rodapé compacto** e **botão flutuante**.

### Contato (`/contato`)

- Página com um único card de formulário detalhado: nome, e-mail, assunto e descrição.
- Ação **Enviar mensagem**: cria uma `HomepageInquiry` com origem `CONTATO_INTERNO` e mostra confirmação local.
- Ação **Continuar no WhatsApp**: cria uma `HomepageInquiry` com origem `WHATSAPP`, mostra confirmação e abre `wa.me` com os dados essenciais pré-preenchidos para `5533987009784`.
- O card inclui um aviso conciso: não usar o formulário para urgências; os dados são usados para responder ao contato.

### Mensagem flutuante

- Janela modal acessível, aberta pelo botão flutuante em qualquer página pública.
- Formulário direto: nome, e-mail e mensagem curta.
- Ao enviar, cria uma `HomepageInquiry` com origem `FLUTUANTE`; não abre WhatsApp e não simula conversa em tempo real.
- Mostra confirmação e permite fechar a janela. Escape, foco inicial, retorno do foco ao gatilho e clique no botão de fechar devem funcionar.

### Área do paciente (`/entrar`)

- Continua sendo a entrada para o portal existente, sem alteração no login ou nas rotas protegidas.

## Dados e segurança

- Criar o modelo Prisma `HomepageInquiry` com `name`, `email`, `subject` opcional, `message`, `source`, `readAt`, `createdAt` e os índices necessários para a listagem administrativa.
- `source` é um enum independente com os valores `FLUTUANTE`, `CONTATO_INTERNO` e `WHATSAPP`.
- Criar endpoint público próprio para validar e registrar essas mensagens. Ele não aceita `recipientId`, não depende de sessão e não acessa `ContactMessage`.
- Validar nome, e-mail, assunto opcional e tamanho das mensagens no servidor.
- Não incluir dados da mensagem na URL do WhatsApp além do que a pessoa acabou de fornecer; o redirecionamento ocorre somente após persistência bem-sucedida.
- Manter `ContactMessage` e a rota `/api/v1/contact-messages` exclusivamente para comunicação autenticada de paciente e equipe.

## Painel administrativo

- `/admin/mensagens` exibe duas áreas visuais distintas:
  - **Homepage**: lista de `HomepageInquiry`, com origem, nome, e-mail, assunto, mensagem e data.
  - **Pacientes**: lista atual de `ContactMessage`, vinculada ao contexto interno de atendimento.
- A composição não permite responder uma mensagem pública pela interface atual, pois não há envio de e-mail ou API de WhatsApp neste escopo.
- O resumo administrativo apresenta a contagem de mensagens públicas não lidas separadamente das mensagens de pacientes não lidas.

## Componentes e rotas

- `app/page.tsx` passa a renderizar somente a landing de entrada, cabeçalho, rodapé e botão flutuante.
- Criar `app/contato/page.tsx`; remover as rotas públicas propostas anteriormente que não têm conteúdo suficiente.
- `SiteHeader` usa links por rota, com marca para `/`, contato para `/contato` e área do paciente para `/entrar`.
- `FloatingContactButton` torna-se componente cliente e controla a janela de mensagem pública.
- Criar componentes focados para o formulário do contato, a janela flutuante e a lista administrativa de mensagens públicas.
- `lib/content.ts` continua como origem do texto público, agora reduzido à landing e ao contato.
- `app/globals.css` remove os estilos inativos da homepage longa e contém os estilos do card de entrada, card complementar, página de contato e janela modal.

## Verificação

- Testes de conteúdo: menu mínimo, descrição “Psicanalista”, imagem prioritária e ausência de seções longas na homepage.
- Testes de validação e do endpoint de mensagens públicas: dados válidos, dados inválidos e origem registrada.
- Testes da URL do WhatsApp: usa o número configurado e apenas monta a URL após a resposta bem-sucedida.
- `npm test`, `npm run lint` e `npm run build` devem passar.
- Conferir desktop e mobile: foto presente, altura controlada, navegação por rota, modal acessível, mensagens públicas no painel correto e mensagens do portal ainda isoladas.

## Critérios de aceite

- A homepage funciona como uma entrada visual curta, com foto e apenas um card complementar.
- O menu público contém somente destinos úteis e carrega contextos de tela distintos.
- O botão flutuante registra contato público de forma rápida, sem login.
- A página de contato registra mensagens detalhadas e oferece continuação no WhatsApp.
- Todas as mensagens públicas são armazenadas em `HomepageInquiry`, identificadas pela origem e exibidas separadamente para a Teka.
- Mensagens autenticadas do portal permanecem em `ContactMessage` e não se confundem com contatos da homepage.
