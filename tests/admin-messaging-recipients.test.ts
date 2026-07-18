import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { listClientMessageRecipients } from "@/lib/internal-messages";
import { prisma } from "@/lib/db";

test("terapeuta pode selecionar clientes autocadastrados como destinatários", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [therapist, selfRegisteredClient] = await Promise.all([
    prisma.user.create({ data: { name: "Terapeuta", email: `therapist-recipient-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
    prisma.user.create({ data: { name: "Cliente autocadastrado", email: `client-recipient-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
  ]);

  try {
    const recipients = await listClientMessageRecipients({ id: therapist.id, role: "THERAPIST" });

    assert.ok(recipients.some((recipient) => recipient.id === selfRegisteredClient.id));
    assert.ok(recipients.every((recipient) => recipient.role === "CLIENT"));
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [therapist.id, selfRegisteredClient.id] } } });
  }
});

test("página de mensagens usa seletor de destinatário em vez do primeiro remetente", async () => {
  const [page, form] = await Promise.all([
    readFile("app/admin/mensagens/page.tsx", "utf8"),
    readFile("components/contact-request-form.tsx", "utf8"),
  ]);

  assert.match(page, /listClientMessageRecipients/);
  assert.match(page, /recipients=\{clientRecipients\}/);
  assert.doesNotMatch(page, /messages\[0\]\?\.sender/);
  assert.match(form, /<select/);
  assert.match(form, /selectedRecipientId/);
});
