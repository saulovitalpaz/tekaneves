import assert from "node:assert/strict";
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
