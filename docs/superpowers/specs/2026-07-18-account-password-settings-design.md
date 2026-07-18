# Configurações de Conta e Credenciais Internas

## Contexto

O beta já possui autenticação por sessão, autocadastro de clientes e seed das contas internas. As contas internas precisam usar os novos emails `vitoria@tekaneves.psi` e `marilene@tekaneves.psi`, com senha inicial fornecida por `SEED_PASSWORD`. Clientes devem continuar sendo criados apenas pelo autocadastro. Depois do login, cada usuário precisa trocar a própria senha em uma área interna.

## Objetivos

- Fazer o seed criar ou atualizar somente a conta administrativa e a conta terapeuta.
- Migrar, quando encontrados, os emails legados `admin@teka.local` e `terapeuta@teka.local` para os novos emails sem apagar dados relacionados.
- Não criar cliente de desenvolvimento no seed e não apagar clientes existentes.
- Expor `/configuracoes` para qualquer usuário autenticado.
- Permitir que cada usuário altere somente o próprio `passwordHash`.
- Exigir senha atual, nova senha e confirmação da nova senha.
- Manter os emails imutáveis nessa tela.

## Arquitetura aprovada

### Seed

`prisma/seed.ts` manterá o helper de upsert para contas internas. O seed usará `SEED_PASSWORD` para a senha inicial, configurada somente no ambiente, e executará a atualização dos emails legados antes do upsert dos novos emails. O perfil e disponibilidade da terapeuta continuarão sendo atualizados normalmente. O seed não chamará mais `upsertUser` para cliente.

Os dados recomendados serão:

| Função | Email inicial | Nome | Credencial |
|---|---|---|---|
| Admin | `vitoria@tekaneves.psi` | `Vitória Neves da Paz Lima` | `SEED_PASSWORD` |
| Terapeuta | `marilene@tekaneves.psi` | `Marilene Neves da Paz Lima` | `SEED_PASSWORD` |

### API

Criar `PATCH /api/v1/auth/password`.

Contrato de entrada:

```json
{
  "currentPassword": "senha atual",
  "newPassword": "nova senha",
  "confirmPassword": "nova senha"
}
```

Fluxo:

1. Obter o usuário da sessão atual; sem sessão retornar `401`.
2. Validar os três campos; senha nova deve ter pelo menos 8 caracteres e coincidir com a confirmação.
3. Buscar o `passwordHash` do próprio usuário.
4. Verificar a senha atual com bcrypt; se inválida retornar `400` sem alterar o banco.
5. Gerar hash bcrypt da nova senha e atualizar somente o usuário da sessão.
6. Retornar dados mínimos de sucesso, sem senha ou hash.

### Interface

Criar `app/configuracoes/page.tsx` protegido por `requireUser()` e `components/password-settings-form.tsx` como componente client. Os shells de admin/terapeuta e cliente terão um link `Configurações` apontando para `/configuracoes`. A página mostrará email somente como informação, sem campo editável, e exibirá estados de carregamento, erro e sucesso.

### Validação e testes

- Adicionar `changePasswordSchema` em `lib/validation.ts`.
- Testar validação de senha curta, confirmação divergente e payload válido.
- Testar a API para sessão ausente, senha atual inválida e atualização do próprio usuário.
- Testar que o seed não cria cliente e expõe os novos emails de desenvolvimento.
- Rodar testes existentes, lint, build e validação Prisma.

## Fora de escopo

- Alteração de email pelo usuário.
- Recuperação de senha por email.
- Troca de senha de terceiros pelo admin.
- Remoção de clientes antigos já persistidos.
- Nova migration de banco; o campo de senha já existe.
