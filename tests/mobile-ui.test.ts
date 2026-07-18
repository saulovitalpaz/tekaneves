import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("define tokens de cards suaves com sombra verde sutil", async () => {
  const css = await readFile("app/globals.css", "utf8");
  assert.match(css, /--card-radius:/);
  assert.match(css, /--card-shadow:/);
  assert.match(css, /rgb\(11 51 46 \/ 0\.08\)/);
  assert.match(css, /box-shadow: var\(--card-shadow\)/);
});

test("mantém navegação mobile sem faixa horizontal e com alvos de toque", async () => {
  const css = await readFile("app/globals.css", "utf8");
  assert.match(css, /touch-action: manipulation/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /\.portal-nav\s*\{\s*display: grid/);
  assert.doesNotMatch(css, /overflow-x: auto/);
});

test("shells usam áreas de ação nomeadas para toque mobile", async () => {
  const [portalShell, adminShell] = await Promise.all([
    readFile("components/portal-shell.tsx", "utf8"),
    readFile("components/admin-shell.tsx", "utf8"),
  ]);
  assert.match(portalShell, /portal-actions/);
  assert.match(adminShell, /portal-actions/);
});
