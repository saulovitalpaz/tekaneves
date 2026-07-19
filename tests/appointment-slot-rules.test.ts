import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { appointmentEnd, isWithinAvailability, slotErrorMessage } from "@/lib/scheduling";

const mondayAtNine = new Date("2030-01-07T09:00:00.000Z");

test("horário solicitado precisa caber em disponibilidade ativa", () => {
  const availability = [{ weekday: 1, startMinutes: 9 * 60, endMinutes: 17 * 60, isActive: true }];

  assert.equal(isWithinAvailability(mondayAtNine, appointmentEnd(mondayAtNine, 50), availability), true);

  const beforeWindow = new Date("2030-01-07T08:30:00.000Z");
  assert.equal(isWithinAvailability(beforeWindow, appointmentEnd(beforeWindow, 50), availability), false);

  const overflowsWindow = new Date("2030-01-07T16:30:00.000Z");
  assert.equal(isWithinAvailability(overflowsWindow, appointmentEnd(overflowsWindow, 60), availability), false);

  assert.equal(isWithinAvailability(mondayAtNine, appointmentEnd(mondayAtNine, 50), [{ ...availability[0], isActive: false }]), false);
});

test("erros de agendamento usam mensagens legíveis", () => {
  assert.equal(slotErrorMessage("SLOT_UNAVAILABLE"), "Já existe atendimento nesse horário para essa terapeuta.");
  assert.equal(slotErrorMessage("OUTSIDE_AVAILABILITY"), "Esse horário está fora da disponibilidade cadastrada da terapeuta.");
});

test("rotas de agendamento usam validação compartilhada de horário", async () => {
  const [clientRequestRoute, decisionRoute, adminAppointments] = await Promise.all([
    readFile("app/api/v1/appointment-requests/route.ts", "utf8"),
    readFile("app/api/v1/appointment-requests/[id]/route.ts", "utf8"),
    readFile("lib/admin-appointments.ts", "utf8"),
  ]);

  assert.match(clientRequestRoute, /ensureTherapistSlotIsBookable/);
  assert.match(decisionRoute, /ensureTherapistSlotIsBookable/);
  assert.match(adminAppointments, /ensureTherapistSlotIsBookable/);
});

test("pré-cadastros rejeitados não bloqueiam novos horários", async () => {
  const source = await readFile("lib/scheduling.ts", "utf8");

  assert.match(source, /preRegistration:\s*\{\s*rejectedAt:\s*null\s*\}/);
});
