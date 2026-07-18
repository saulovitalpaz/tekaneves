# Homepage e área autenticada: entrada, contato e identidade visual

## Objetivo

Reorganizar a homepage para concentrar a primeira impressão na apresentação da profissional, preservar o contato final como principal conversão e alinhar login/portal à identidade marfim, verde profundo e dourado já usada na página pública.

## Escopo aprovado

- Transformar o primeiro grande bloco da homepage em uma entrada editorial com foto da profissional e o conteúdo atual de “Sobre mim”.
- Remover os cards de “Ansiedade”, “Exaustão” e “Relacionamentos”.
- Manter “Acompanhamento” como conteúdo textual, sem grade de cards.
- Manter a faixa “Para quem é” como transição visual antes do contato.
- Preservar o card/formulário de contato da referência, com CTA da entrada, menu e botão flutuante apontando para `#contato`.
- Manter o menu superior com as âncoras públicas e CTA de contato.
- Alinhar login, cadastro, portal do paciente e painel da terapeuta à identidade visual pública, removendo o azul hardcoded.
- Tornar os perfis locais de desenvolvimento mais evidentes na tela de login e na documentação, sem expor essa ajuda em produção.
- Preservar a lógica existente da agenda e do salvamento de disponibilidade/consultas.

Fora de escopo: alterar regras de autenticação, mudar o modelo Prisma, criar envio real de contato, adicionar integrações externas ou reescrever o fluxo de decisões da agenda.

## Estrutura visual

### Homepage

1. **Cabeçalho** — marca Teka Neves, links para Acompanhamento, Para quem é, Sobre e Contato, além do CTA “Falar comigo”. O desktop fica em uma linha; o mobile evita overflow e mantém o acesso ao contato.
2. **Entrada / Sobre** — seção principal com foto à esquerda, eyebrow “Sobre mim”, título “Escuta atenta, cuidado e respeito pelo seu tempo.”, os dois parágrafos de apresentação e CTA “Vamos conversar”. O bloco recebe o foco semântico principal da página.
3. **Acompanhamento** — eyebrow, título e descrição sobre o processo terapêutico em layout editorial arejado; os três cards de temas são removidos.
4. **Para quem é** — faixa verde profunda com a mensagem inclusiva e seu parágrafo de apoio.
5. **Contato** — painel creme com texto à esquerda e formulário à direita, preservando o comportamento local atual.
6. **Rodapé e atalho flutuante** — navegação e botão persistente para o contato.

Não será adicionado um card intermediário nesta etapa: a entrada, o CTA flutuante e o contato final já formam uma jornada curta e clara.

### Área autenticada

- Login e cadastro usam os mesmos tokens de cor, tipografia, bordas e foco da homepage.
- Login exibe uma ajuda curta para desenvolvimento local com os emails dos perfis seedados e referência a `SEED_PASSWORD`; essa ajuda só é renderizada fora de produção.
- Portal do paciente e painel administrativo mantêm a arquitetura e navegação atuais, mas substituem o fundo azul `#062851` por `var(--forest-deep)`.
- Nenhuma mudança de contrato será feita nas APIs de autenticação, agenda, disponibilidade ou consultas.

## Arquitetura de componentes

- `app/page.tsx` passa a compor a entrada com o componente de apresentação que já contém imagem e conteúdo “Sobre mim”; a seção duplicada de sobre é removida da composição.
- `components/support-section.tsx` permanece como seção textual e deixa de renderizar áreas em cards.
- `lib/content.ts` continua sendo a fonte única de textos, com a navegação e CTAs atualizados.
- `app/globals.css` concentra os ajustes de layout da entrada, acompanhamento, cabeçalho, contato e tokens do portal.
- `app/entrar/page.tsx` e `components/auth-form.tsx` recebem apenas a ajuda visual de desenvolvimento necessária; autenticação e redirecionamentos permanecem iguais.
- `components/portal-shell.tsx` e `components/admin-shell.tsx` mantêm seus links e ícones, usando os tokens de marca já existentes.
- `prisma/seed.ts` permanece a fonte dos perfis locais. Se houver ajuste de documentação, ele não muda emails, papéis ou senha configurável.

## Fluxo e estados

- CTA da entrada, CTA do cabeçalho e botão flutuante levam a `#contato`.
- Formulário de contato continua validando localmente e exibindo sucesso/erro sem request externo.
- Login continua redirecionando `ADMIN`/`THERAPIST` para `/admin` e `CLIENT` para `/portal`.
- Usuário terapeuta seedado continua podendo abrir a agenda, salvar disponibilidade e decidir solicitações.
- A ajuda de desenvolvimento não deve aparecer em builds de produção.

## Verificação

- `npm run lint` deve passar sem erros TypeScript.
- `npm run build` deve concluir a compilação de produção.
- `npm test` deve continuar passando.
- Conferir a homepage em desktop e mobile: sem cards de temas, sem seção “Sobre” duplicada, sem overflow horizontal e com todos os destinos de navegação válidos.
- Conferir login/cadastro/portal/admin usando os perfis locais seedados; verificar que a área autenticada não usa o azul anterior.
- Conferir o fluxo da agenda: disponibilidade salva e solicitações continuam acessíveis para o usuário terapeuta.
- Conferir foco visível, contraste, texto alternativo da foto e comportamento com `prefers-reduced-motion`.

## Critérios de aceite

- A primeira entrada comunica imediatamente quem é a profissional e como iniciar uma conversa.
- Os cards de “Ansiedade”, “Exaustão” e “Relacionamentos” não aparecem mais na homepage.
- O contato final permanece visual e funcionalmente próximo à referência aprovada.
- Menu superior, CTA da entrada e botão flutuante conduzem ao contato.
- Login, portal e painel administrativo usam a mesma linguagem visual da homepage, sem azul institucional isolado.
- Os acessos locais de desenvolvimento ficam identificáveis sem alterar o comportamento de produção.
- A agenda continua salvando dados e aceitando o fluxo atual de solicitações.
