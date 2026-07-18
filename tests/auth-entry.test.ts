import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("login mantém autocadastro somente pelo link criar conta", async () => {
  const source = await readFile("app/entrar/page.tsx", "utf8");

  assert.match(source, /Criar conta/);
  assert.doesNotMatch(source, /Autocadastro do cliente/);
  assert.doesNotMatch(source, /<AuthForm mode="register" \/>/);
  assert.doesNotMatch(source, /Primeiro acesso/);
});
