import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { homepageInquirySourceLabel } from "@/components/homepage-inquiry-list";

test("homepage inquiry labels preserve their distinct source", () => {
  assert.equal(homepageInquirySourceLabel("FLUTUANTE"), "Janela flutuante");
  assert.equal(homepageInquirySourceLabel("CONTATO_INTERNO"), "Contato pelo site");
  assert.equal(homepageInquirySourceLabel("WHATSAPP"), "WhatsApp");
});

test("cards de lead não clicáveis usam dimensionamento compacto por conteúdo", async () => {
  const css = await readFile("app/globals.css", "utf8");

  assert.match(css, /\.homepage-inquiry-list\s*\{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 18rem\), max-content\)\)/);
  assert.match(css, /\.homepage-inquiry-card\s*\{[^}]*width: fit-content/);
  assert.match(css, /\.homepage-inquiry-card\s*\{[^}]*max-width: min\(100%, 24rem\)/);
});
