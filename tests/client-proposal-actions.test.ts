import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("cliente pode aceitar ou recusar horário proposto com mensagem sobreposta", async () => {
  const componentPath = "components/appointment-proposal-actions.tsx";
  const componentExists = await access(componentPath).then(() => true, () => false);

  assert.equal(componentExists, true);

  const [page, component, endpoint] = await Promise.all([
    readFile("app/portal/consultas/page.tsx", "utf8"),
    readFile(componentPath, "utf8"),
    readFile("app/api/v1/appointment-requests/[id]/route.ts", "utf8"),
  ]);

  assert.match(page, /AppointmentProposalActions/);
  assert.match(page, /proposedStart/);
  assert.match(component, /proposal-dialog/);
  assert.match(component, /\/api\/v1\/contact-messages/);
  assert.match(component, /status: "CONFIRMED"/);
  assert.match(component, /status: "DECLINED"/);
  assert.match(endpoint, /user\.role === "CLIENT"/);
  assert.match(endpoint, /requestRecord\.clientId !== user\.id/);
  assert.match(endpoint, /requestRecord\.status !== "PROPOSED"/);
});
