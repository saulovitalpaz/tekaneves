import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  "app/admin/mensagens/page.tsx",
  "app/portal/contato/page.tsx",
];

test("App Router pages use asynchronous searchParams", async () => {
  for (const page of pages) {
    const source = await readFile(page, "utf8");

    assert.match(source, /searchParams\?: Promise<[^>]+>/, page);
    assert.doesNotMatch(source, /searchParams\?: Promise<[^>]+>\s*\|/, page);
  }
});
