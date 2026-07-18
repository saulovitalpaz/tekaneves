import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { changePasswordSchema } from "@/lib/validation";

test("troca de senha rejeita confirmação divergente e senha curta", () => {
  assert.equal(changePasswordSchema.safeParse({
    currentPassword: "senha-atual",
    newPassword: "curta",
    confirmPassword: "curta",
  }).success, false);

  assert.equal(changePasswordSchema.safeParse({
    currentPassword: "senha-atual",
    newPassword: "senha-nova-123",
    confirmPassword: "senha-nova-321",
  }).success, false);
});

test("troca de senha aceita payload completo", () => {
  assert.equal(changePasswordSchema.safeParse({
    currentPassword: "senha-atual",
    newPassword: "senha-nova-123",
    confirmPassword: "senha-nova-123",
  }).success, true);
});

test("seed atualiza somente contas internas e não imprime senha", async () => {
  const source = await readFile("prisma/seed.ts", "utf8");

  assert.match(source, /vitoria@tekaneves\.psi/);
  assert.match(source, /vitória@tekaneves\.psi/);
  assert.match(source, /marilene@tekaneves\.psi/);
  assert.doesNotMatch(source, /cliente@teka\.local/);
  assert.doesNotMatch(source, /Development password/);
  assert.doesNotMatch(source, /Cannot migrate/);
  assert.match(source, /process\.env\.SEED_PASSWORD/);
});

test("configurações internas usam endpoint autenticado de senha", async () => {
  const [page, form, adminShell, portalShell, route] = await Promise.all([
    readFile("app/configuracoes/page.tsx", "utf8"),
    readFile("components/password-settings-form.tsx", "utf8"),
    readFile("components/admin-shell.tsx", "utf8"),
    readFile("components/portal-shell.tsx", "utf8"),
    readFile("app/api/v1/auth/password/route.ts", "utf8"),
  ]);

  assert.match(page, /requireUser/);
  assert.match(form, /\/api\/v1\/auth\/password/);
  assert.match(adminShell, /\/configuracoes/);
  assert.match(portalShell, /\/configuracoes/);
  assert.match(route, /getCurrentUser/);
  assert.match(route, /verifyPassword/);
  assert.match(route, /hashPassword/);
  assert.match(route, /revokeOtherSessions/);
});
