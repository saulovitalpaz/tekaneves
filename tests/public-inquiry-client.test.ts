import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildWhatsAppUrl, submitHomepageInquiry } from "@/lib/public-inquiry";

const payload = {
  name: "Ana Silva",
  email: "ana@example.com",
  subject: "Primeiro contato",
  message: "Gostaria de saber mais.",
  source: "WHATSAPP" as const,
};

test("builds a WhatsApp URL with the configured number and supplied inquiry values", () => {
  const url = new URL(buildWhatsAppUrl(payload));

  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5533987009784");
  assert.equal(url.searchParams.get("text"), "Nome: Ana Silva\nE-mail: ana@example.com\nAssunto: Primeiro contato\nMensagem: Gostaria de saber mais.");
});

test("submits homepage inquiries only to the public inquiry endpoint", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  const result = await submitHomepageInquiry(payload, async (input, init) => {
    requestUrl = input.toString();
    requestInit = init;
    return new Response(JSON.stringify({ data: { id: "inquiry-1" }, error: null }), { status: 201 });
  });

  assert.equal(requestUrl, "/api/v1/homepage-inquiries");
  assert.deepEqual(requestInit, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.deepEqual(result, { id: "inquiry-1" });
});

test("navigates to WhatsApp only after public inquiry persistence succeeds", () => {
  const formSource = readFileSync(join(process.cwd(), "components/public-inquiry-form.tsx"), "utf8");

  assert.match(formSource, /await submitHomepageInquiry\(payload\);[\s\S]*window\.location\.assign\(buildWhatsAppUrl\(payload\)\)/);
  assert.doesNotMatch(formSource, /window\.open\(/);
});

test("keeps Tab navigation inside the floating contact dialog", () => {
  const dialogSource = readFileSync(join(process.cwd(), "components/floating-contact-button.tsx"), "utf8");

  assert.match(dialogSource, /event\.key !== "Tab"/);
  assert.match(dialogSource, /event\.shiftKey/);
  assert.match(dialogSource, /dialogRef\.current/);
});
