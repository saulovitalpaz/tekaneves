import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a agenda administrativa inclui consultas confirmadas, concluídas e notas", async () => {
  const source = await readFile("app/admin/agenda/page.tsx", "utf8");
  assert.match(source, /AppointmentStatus\.CONFIRMED/);
  assert.match(source, /AppointmentStatus\.COMPLETED/);
  assert.match(source, /AppointmentSummaryForm/);
});

test("o portal do cliente não consulta resumo clínico", async () => {
  const source = await readFile("app/portal/consultas/page.tsx", "utf8");
  assert.match(source, /appointment\?\.status \?\? request\.status/);
  assert.doesNotMatch(source, /summary|AppointmentSummary/i);
});

test("o detalhe administrativo do cliente possui lembrete único e histórico privado", async () => {
  const [clients, detail] = await Promise.all([
    readFile("app/admin/clientes/page.tsx", "utf8"),
    readFile("app/admin/clientes/[id]/page.tsx", "utf8"),
  ]);
  assert.match(clients, /href=\{`\/admin\/clientes\/\$\{client\.id\}`\}/);
  assert.match(detail, /Próxima consulta/);
  assert.match(detail, /findFirst/);
  assert.match(detail, /summary/);
});
