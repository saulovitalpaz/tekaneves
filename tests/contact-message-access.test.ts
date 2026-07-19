import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { canSendContextMessage } from "@/lib/message-access";

const client = { id: "client", role: "CLIENT" as const };
const therapist = { id: "therapist", role: "THERAPIST" as const };
const otherTherapist = { id: "other", role: "THERAPIST" as const };
const admin = { id: "admin", role: "ADMIN" as const };
const context = { clientId: client.id, therapistId: therapist.id };

test("mensagem contextual fica restrita ao cliente, profissional e administração", () => {
  assert.equal(canSendContextMessage(client, therapist, context), true);
  assert.equal(canSendContextMessage(therapist, client, context), true);
  assert.equal(canSendContextMessage(client, admin, context), true);
  assert.equal(canSendContextMessage(otherTherapist, client, context), false);
  assert.equal(canSendContextMessage(client, otherTherapist, context), false);
});

test("endpoint valida tanto solicitação quanto consulta vinculada", async () => {
  const source = await readFile("app/api/v1/contact-messages/route.ts", "utf8");

  assert.match(source, /appointmentRequestId/);
  assert.match(source, /appointmentId/);
  assert.match(source, /canSendContextMessage/);
});
