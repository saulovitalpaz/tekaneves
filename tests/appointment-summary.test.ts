import assert from "node:assert/strict";
import test from "node:test";

import { AppointmentStatus } from "@prisma/client";
import { managedAppointmentWhere, validateAppointmentStatusTransition } from "@/lib/appointment-access";
import { isSummaryEligible, upsertAppointmentSummary } from "@/lib/appointment-summaries";
import { prisma } from "@/lib/db";

test("mantém uma única nota por consulta e preserva o primeiro autor", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [client, therapist] = await Promise.all([
    prisma.user.create({ data: { name: "Cliente", email: `client-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
    prisma.user.create({ data: { name: "Teka", email: `teka-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
  ]);
  const request = await prisma.appointmentRequest.create({ data: { clientId: client.id, therapistId: therapist.id, desiredStart: new Date("2030-01-01T10:00:00.000Z"), durationMinutes: 50, message: "Consulta" } });
  const appointment = await prisma.appointment.create({ data: { requestId: request.id, clientId: client.id, therapistId: therapist.id, startAt: new Date("2030-01-01T10:00:00.000Z"), endAt: new Date("2030-01-01T10:50:00.000Z") } });

  try {
    const created = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: therapist.id, body: "Primeiro resumo." });
    const updated = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: client.id, body: "Resumo atualizado." });

    assert.equal(created.authorId, therapist.id);
    assert.equal(updated.id, created.id);
    assert.equal(updated.authorId, therapist.id);
    assert.equal(updated.body, "Resumo atualizado.");
    assert.equal(await prisma.appointmentSummary.count({ where: { appointmentId: appointment.id } }), 1);
  } finally {
    await prisma.appointmentSummary.deleteMany({ where: { appointmentId: appointment.id } });
    await prisma.appointment.deleteMany({ where: { id: appointment.id } });
    await prisma.appointmentRequest.deleteMany({ where: { id: request.id } });
    await prisma.user.deleteMany({ where: { id: { in: [client.id, therapist.id] } } });
  }
});

test("permite nota apenas em consultas confirmadas ou concluídas", () => {
  assert.equal(isSummaryEligible(AppointmentStatus.CONFIRMED), true);
  assert.equal(isSummaryEligible(AppointmentStatus.COMPLETED), true);
  assert.equal(isSummaryEligible(AppointmentStatus.CANCELLED), false);
});

test("gera escopo administrativo sem expor consulta para cliente ou outra profissional", () => {
  assert.deepEqual(managedAppointmentWhere({ id: "admin", role: "ADMIN" }, "appt-1"), { id: "appt-1" });
  assert.deepEqual(managedAppointmentWhere({ id: "teka", role: "THERAPIST" }, "appt-1"), { id: "appt-1", therapistId: "teka" });
  assert.equal(managedAppointmentWhere({ id: "client", role: "CLIENT" }, "appt-1"), null);
});

test("bloqueia cancelamento de consulta confirmada quando já existe resumo privado", () => {
  assert.deepEqual(validateAppointmentStatusTransition({ currentStatus: "CONFIRMED", nextStatus: "CANCELLED", hasSummary: true }), {
    ok: false,
    code: "SUMMARY_EXISTS",
    message: "Remova o resumo privado antes de cancelar esta consulta.",
  });
  assert.deepEqual(validateAppointmentStatusTransition({ currentStatus: "CONFIRMED", nextStatus: "COMPLETED", hasSummary: true }), { ok: true });
});
