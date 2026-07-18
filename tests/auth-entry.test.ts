import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("login expõe autocadastro de cliente no próprio card", async () => {
  const source = await readFile("app/entrar/page.tsx", "utf8");

  assert.match(source, /Autocadastro do cliente/);
  assert.match(source, /<AuthForm mode="register" \/>/);
  assert.match(source, /Primeiro acesso/);
});
