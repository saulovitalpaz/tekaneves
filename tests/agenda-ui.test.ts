import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("a agenda administrativa separa operação de resumos privados", async () => {
  const source = await readFile("app/admin/agenda/page.tsx", "utf8");
  assert.match(source, /AppointmentStatus\.CONFIRMED/);
  assert.match(source, /Próximos atendimentos/);
  assert.match(source, /Solicitações/);
  assert.match(source, /Disponibilidade/);
  assert.match(source, /<details/);
  assert.doesNotMatch(source, /AppointmentSummaryForm/);
  assert.doesNotMatch(source, /Atendimentos concluídos/);
});

test("submenu de resumos concentra formulários vinculados a consultas confirmadas", async () => {
  const summariesPath = "app/admin/resumos/page.tsx";
  const summariesExists = await access(summariesPath).then(() => true, () => false);

  assert.equal(summariesExists, true);

  const [shell, summaries] = await Promise.all([readFile("components/admin-shell.tsx", "utf8"), readFile(summariesPath, "utf8")]);

  assert.match(shell, /href="\/admin\/resumos"/);
  assert.match(summaries, /AppointmentStatus\.CONFIRMED/);
  assert.match(summaries, /AppointmentStatus\.COMPLETED/);
  assert.match(summaries, /AppointmentSummaryForm/);
  assert.match(summaries, /Atendimentos concluídos/);
  assert.match(summaries, /client: true/);
  assert.match(summaries, /therapist: true/);
});

test("painel administrativo remove atalhos redundantes e agenda recebe inserção manual", async () => {
  const [adminPage, agendaPage] = await Promise.all([
    readFile("app/admin/page.tsx", "utf8"),
    readFile("app/admin/agenda/page.tsx", "utf8"),
  ]);

  assert.doesNotMatch(adminPage, /quick-links/);
  assert.doesNotMatch(adminPage, /Organizar agenda/);
  assert.match(agendaPage, /AdminAppointmentForm/);
  assert.match(agendaPage, /PreRegistrationLinkForm/);
  assert.match(agendaPage, /PreRegistrationRejectButton/);
  assert.match(agendaPage, /Pré-cadastros/);
  assert.match(agendaPage, /rejectedAt: null/);
});

test("pré-cadastros podem ser rejeitados sem exclusão física", async () => {
  const routePath = "app/api/v1/admin/pre-registrations/[id]/reject/route.ts";
  const routeExists = await access(routePath).then(() => true, () => false);
  assert.equal(routeExists, true);

  const [schema, route, component] = await Promise.all([
    readFile("prisma/schema.prisma", "utf8"),
    readFile(routePath, "utf8"),
    readFile("components/pre-registration-reject-button.tsx", "utf8"),
  ]);

  assert.match(schema, /rejectedAt\s+DateTime\?/);
  assert.match(route, /rejectedAt: new Date\(\)/);
  assert.doesNotMatch(route, /delete/);
  assert.match(component, /Rejeitar/);
});

test("o portal do cliente consulta apenas a nota explicitamente pública", async () => {
  const source = await readFile("app/portal/consultas/page.tsx", "utf8");
  assert.match(source, /appointment\?\.status \?\? request\.status/);
  assert.match(source, /summary:\s*\{\s*select:\s*\{\s*clientNote:\s*true/);
  assert.doesNotMatch(source, /summary:\s*true|summary:\s*\{\s*include/);
  assert.doesNotMatch(source, /summary\?\.body/);
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
