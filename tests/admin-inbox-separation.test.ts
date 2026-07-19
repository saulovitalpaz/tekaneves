import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("lead da homepage pode ser marcado como lido sem apagar registro", async () => {
  const routePath = "app/api/v1/admin/homepage-inquiries/[id]/read/route.ts";
  const routeExists = await access(routePath).then(() => true, () => false);
  assert.equal(routeExists, true);

  const [component, route] = await Promise.all([
    readFile("components/homepage-inquiry-list.tsx", "utf8"),
    readFile(routePath, "utf8"),
  ]);

  assert.match(component, /HomepageInquiryReadButton/);
  assert.match(component, /readAt/);
  assert.match(route, /readAt: new Date\(\)/);
  assert.doesNotMatch(route, /delete/);
});

test("histórico interno administrativo inclui enviadas e recebidas", async () => {
  const source = await readFile("lib/internal-messages.ts", "utf8");

  assert.match(source, /export async function listInternalInbox[\s\S]*OR:\s*\[[\s\S]*senderId[\s\S]*recipientId/);
  assert.match(source, /export async function listTekaAdminInbox[\s\S]*OR:\s*\[/);
});
