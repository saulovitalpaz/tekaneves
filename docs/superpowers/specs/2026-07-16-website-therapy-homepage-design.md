# Website de Psicanálise: Homepage Inicial

## Objetivo

Criar a primeira versão pública de um website para uma psicoterapeuta, com posicionamento amplo para pessoas em diferentes fases da vida. A homepage deve comunicar acolhimento, segurança e profissionalismo, gerar contato e deixar uma base clara para futuras funções de área do paciente.

## Escopo da primeira versão

- Homepage pública acessível somente em localhost durante o desenvolvimento.
- Navegação com âncoras para acompanhamento, para quem é, sobre e contato.
- Hero editorial inspirado em `option-2.png`.
- Uso de `profile.jpeg` como imagem principal da terapeuta.
- Conteúdo em português do Brasil.
- Formulário de contato com validação local e estados de sucesso e erro no navegador.
- Layout responsivo para desktop, tablet e celular.
- Preparação estrutural para futuras rotas `/entrar`, `/dashboard`, `/agendar` e `/historico`.

Ficam fora desta etapa: autenticação, persistência de dados, banco, envio real de formulário, agenda, histórico, chat, pagamentos e integrações externas.

## Direção visual

A interface seguirá uma linguagem acolhedora e editorial, sem replicar literalmente a captura de referência:

- Fundo principal marfim com leve influência verde.
- Verde profundo como cor de marca, títulos e CTAs.
- Dourado suave apenas para detalhes e pequenos acentos.
- Títulos com serif elegante e corpo com sans-serif limpa.
- Hero em duas colunas no desktop, com texto à esquerda e retrato à direita.
- Retrato tratado com formas orgânicas translúcidas em camadas.
- Espaço em branco generoso, bordas suaves e sombras discretas.
- Uma única linguagem visual clara, sem alternância de temas entre seções.

## Estrutura de conteúdo

1. Cabeçalho: marca Teka Neves, links de navegação e CTA de contato.
2. Hero: apresentação geral, promessa de acolhimento e CTA principal.
3. Acompanhamento: explicação simples de como funciona o processo terapêutico.
4. Áreas de acolhimento: ansiedade, exaustão, relacionamentos e transições de vida.
5. Para quem é: mensagem inclusiva para diferentes perfis e momentos.
6. Sobre: apresentação da terapeuta com `profile.jpeg`.
7. Contato: chamada final e formulário local.
8. Rodapé: marca, navegação e aviso de atendimento.

## Arquitetura

O projeto usará Next.js com TypeScript e Tailwind CSS. A homepage será organizada em componentes de apresentação, enquanto textos e dados da terapeuta ficarão separados dos componentes visuais. Uma camada de serviços local poderá ser substituída futuramente por chamadas de API sem alterar a composição da página.

As futuras áreas autenticadas devem ficar isoladas em um grupo de rotas próprio. O modelo de dados futuro será orientado a perfis, terapeutas, consultas, sessões, mensagens e histórico, mas nenhum desses dados será criado ou persistido agora.

## Interações e estados

- Links de navegação levam às seções correspondentes.
- CTAs levam ao contato.
- Formulário valida nome, email e mensagem no cliente.
- Estado de sucesso confirma apenas o processamento local do formulário.
- Estado de erro informa campos inválidos sem perder os valores preenchidos.
- Animações serão discretas e respeitarão `prefers-reduced-motion`.
- A página deve continuar utilizável sem JavaScript para navegação e leitura do conteúdo principal.

## Verificação

- Rodar o projeto em localhost.
- Conferir build de produção.
- Verificar visual em larguras desktop e mobile.
- Testar navegação por teclado, foco visível e contraste.
- Confirmar que nenhuma chamada de rede externa ou persistência é necessária para a homepage.

## Critérios de aceite

- A homepage comunica psicoterapia em geral, sem restringir o público a universitários.
- A estética reconhece a referência visual por paleta, tipografia, composição e ritmo.
- A foto de perfil aparece de forma responsiva e com `alt` descritivo.
- O CTA de contato é evidente sem dominar a página.
- O layout funciona em celular sem rolagem horizontal.
- A estrutura permite adicionar as futuras rotas sem reescrever a homepage.
- O projeto inicia e pode ser editado localmente em localhost.
