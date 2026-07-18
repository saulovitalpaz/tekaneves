# Site público multipágina e homepage de entrada

## Objetivo

Concentrar a homepage em uma entrada visual curta, séria e profissional, com o retrato da psicanalista como elemento central. Substituir as âncoras internas por páginas públicas reais e mover o formulário para uma página de contato própria.

## Escopo aprovado

- Usar “Psicanalista” como a descrição profissional pública no lugar de “Psicoterapeuta” ou “terapeuta”.
- Reduzir a homepage a um card principal de entrada, um único card complementar e um rodapé compacto.
- Manter a foto `public/images/profile.jpeg` no card principal, com enquadramento seguro e carregamento prioritário.
- Criar páginas públicas reais para acompanhamento, para quem é, sobre e contato.
- Trocar os links do menu, os CTAs e o botão flutuante por rotas (`/acompanhamento`, `/para-quem`, `/sobre` e `/contato`), sem âncoras de homepage.
- Preservar o formulário de contato e sua validação local em `/contato`.
- Remover da homepage as seções textuais longas de acompanhamento, para quem é, sobre e contato.
- Manter login, cadastro, portal e painel administrativo sem alterações funcionais.

Fora de escopo: envio real de mensagens, alterações em autenticação, agenda, banco de dados, APIs ou regras de acesso.

## Estrutura visual

### Homepage (`/`)

1. **Cabeçalho compacto** — marca Teka Neves, descrição “Psicanalista”, menu para páginas reais e CTA de contato.
2. **Card principal** — primeira impressão com foto visível, nome, frase curta de acolhimento e CTAs para `/sobre` e `/contato`. A composição deve ficar próxima de uma viewport em desktop, sem acumular blocos editoriais abaixo.
3. **Card complementar** — painel pequeno e visual com uma única mensagem sobre o acompanhamento e link para `/acompanhamento`.
4. **Rodapé compacto** — identificação e aviso local de desenvolvimento. O botão flutuante segue visível e leva para `/contato`.

### Páginas públicas

- **`/acompanhamento`**: título, um parágrafo sobre o processo e CTA para contato.
- **`/para-quem`**: título, um parágrafo acolhedor e CTA para contato.
- **`/sobre`**: retrato e a apresentação profissional completa atualmente usada na homepage, com CTA para contato.
- **`/contato`**: painel existente com texto de apoio e formulário local.

Cada página deve ter apenas uma seção principal, sem colunas sucessivas ou texto com aparência de blog. Elas compartilham cabeçalho, rodapé, tipografia, cores, foco visível e responsividade.

## Arquitetura

- `app/page.tsx` renderiza somente os dois cards de entrada, cabeçalho, rodapé e botão flutuante.
- Criar rotas públicas em `app/acompanhamento/page.tsx`, `app/para-quem/page.tsx`, `app/sobre/page.tsx` e `app/contato/page.tsx`.
- Extrair uma composição pública reutilizável apenas se reduzir repetição entre as quatro páginas; caso contrário, manter os componentes atuais simples e focados.
- `SiteHeader` passa a aceitar links por rota. A marca aponta para `/` e o CTA aponta para `/contato`.
- `FloatingContactButton` aponta para `/contato`.
- `lib/content.ts` permanece a fonte dos textos públicos, agora organizada por página e com a descrição profissional “Psicanalista”.
- `app/globals.css` remove estilos não utilizados da homepage longa e introduz apenas os estilos necessários para o card de entrada, o card complementar e páginas públicas condensadas.

## Fluxos e estados

- Todos os links públicos usam navegação por rota e carregam o novo contexto de tela.
- O formulário em `/contato` conserva a validação e a mensagem local de sucesso/erro atuais.
- A imagem usa `next/image`, `priority` na homepage e `sizes` compatível com o layout responsivo.
- Em telas pequenas, o card principal empilha texto e imagem sem cortar a foto, sem overflow horizontal e sem esconder os CTAs.
- O menu preserva acesso à rota de contato em todos os tamanhos de tela; o botão flutuante funciona como atalho adicional.

## Verificação

- Atualizar testes de conteúdo para exigir rotas públicas, “Psicanalista”, foto prioritária na homepage e ausência de seções longas na composição inicial.
- Executar `npm test`, `npm run lint` e `npm run build`.
- Conferir as cinco rotas públicas em desktop e mobile: imagem visível, menu funcional, CTA correto, altura controlada e sem links `#` na navegação pública.

## Critérios de aceite

- A homepage exibe a foto da profissional e funciona como uma única entrada visual, sem sequência de textos longos.
- Há somente um card complementar após o card principal.
- “Psicanalista” é a descrição profissional em toda a navegação pública.
- Cada item do menu abre uma página pública própria, com conteúdo curto e contexto específico.
- O formulário existe somente em `/contato` e os atalhos levam a essa rota.
- A agenda, autenticação e áreas protegidas continuam funcionando sem mudanças de comportamento.
