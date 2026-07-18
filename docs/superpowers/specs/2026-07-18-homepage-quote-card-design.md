# Homepage Quote Card Design

## Goal

Adicionar um card editável na homepage pública com frases de autoajuda em português, controlado por usuários `ADMIN` e `THERAPIST`. O card pode usar uma frase manual definida no painel ou uma frase gerada por API externa, traduzida quando necessário, com cache de 1 hora.

## Scope

- Admin e terapeuta podem ligar/desligar a exibição do card.
- Admin e terapeuta podem alternar entre modo manual e automático.
- Admin e terapeuta podem editar a frase manual e o autor manual.
- A homepage pública renderiza o card somente quando a configuração estiver visível.
- O modo automático usa uma rota/helper server-side com cache compartilhado de 1 hora.
- Se a busca externa ou a tradução falhar, a frase manual salva no painel é exibida como fallback.

Fora de escopo:

- Histórico de frases exibidas.
- Aprovação editorial de cada frase gerada automaticamente.
- Agendamento de posts ou múltiplos cards.
- Chamada direta da API externa pelo navegador do visitante.

## Data Model

Criar uma configuração persistida, com uma única linha ativa para a homepage:

```prisma
model HomepageQuoteSettings {
  id                   String   @id @default(cuid())
  isQuoteCardVisible   Boolean  @default(false)
  isAutoGenerateActive Boolean  @default(false)
  manualQuoteText      String
  manualQuoteAuthor    String
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

Seed deve criar uma configuração inicial com card visível desligado ou com uma frase manual segura, para que a homepage nunca dependa da API externa para renderizar.

## Server Flow

`getHomepageQuoteCard()` resolve a exibição:

1. Busca a configuração persistida.
2. Se não existir, usa defaults seguros.
3. Se `isQuoteCardVisible` for `false`, retorna `null`.
4. Se `isAutoGenerateActive` for `false`, retorna a frase manual.
5. Se automático estiver ligado, busca uma frase externa no servidor.
6. Se a frase não vier em português, traduz para português no servidor.
7. Cacheia o resultado automático por 1 hora para todos os visitantes.
8. Em qualquer erro externo, retorna a frase manual.

O cache deve ficar fora do client component. A homepage pública recebe uma frase pronta para renderização.

## API

Criar endpoint protegido:

- `GET /api/v1/admin/homepage-quote`
- `PATCH /api/v1/admin/homepage-quote`

Ambos exigem usuário autenticado com papel `ADMIN` ou `THERAPIST`.

Payload de atualização:

```ts
{
  isQuoteCardVisible: boolean;
  isAutoGenerateActive: boolean;
  manualQuoteText: string;
  manualQuoteAuthor: string;
}
```

Validação:

- `manualQuoteText`: string trim, 3 a 240 caracteres.
- `manualQuoteAuthor`: string trim, 2 a 80 caracteres.
- Booleans obrigatórios.

## Admin UI

Adicionar um painel simples de configuração em área administrativa existente, preferencialmente no painel `/admin` para evitar criar uma navegação nova.

Controles:

- Toggle para exibir o card na homepage.
- Toggle para modo automático.
- Campo de texto para frase manual.
- Campo de texto para autor.
- Botão salvar.

O formulário deve indicar erro de validação e sucesso de salvamento. O modo automático não remove a frase manual, porque ela é fallback.

## Public UI

Criar `HomepageQuoteCard` como componente visual da homepage pública.

Renderização:

- Card aparece abaixo do `HomeEntry`.
- Mostra frase em destaque e autor.
- Não mostra botão "Próxima" para visitantes.
- Não mostra status técnico como "modo automático".
- Mantém a estética atual da homepage, com card compacto, responsivo e sem layout de marketing excessivo.

## External Quote And Translation

Criar um adaptador isolado para API externa de frases, para que testes não dependam de rede.

Contrato interno:

```ts
type ResolvedQuote = {
  text: string;
  author: string;
};
```

Se a API externa retornar inglês ou outro idioma, o helper de tradução deve converter para português antes de cachear. A implementação pode começar com endpoint público de tradução ou outro serviço sem chave, mas deve ficar isolada para troca futura.

Se tradução falhar, usar fallback manual em vez de exibir texto em inglês.

## Testing

Adicionar testes antes da implementação:

- Validação aceita configuração correta e rejeita frase/autor vazios.
- Helper retorna `null` quando o card está oculto.
- Helper retorna frase manual quando automático está desligado.
- Helper usa fallback manual quando busca/tradução falha.
- Cache evita nova chamada externa antes de 1 hora.
- Endpoint admin rejeita usuário não autenticado ou papel `CLIENT`.
- Homepage renderiza o card quando visível e não renderiza quando oculto.

## Migration And Safety

Adicionar migration Prisma para `HomepageQuoteSettings`. Como é tabela nova, a migration é aditiva. Não alterar modelos de contato, consultas, mensagens internas ou pré-cadastros.

O `dev.db` local está com drift conhecido; validar a cadeia de migrations em banco SQLite temporário antes de concluir.
