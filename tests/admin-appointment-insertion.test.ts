import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

async function loadAdminAppointmentHelpers() {
  const path = "lib/admin-appointments.ts";
  const exists = await access(path).then(() => true, () => false);

  assert.equal(exists, true);

  return import("@/lib/admin-appointments");
}

async function createOpenAvailability(therapistId: string) {
  await prisma.therapistProfile.create({
    data: {
      userId: therapistId,
      specialty: "Teste",
      availabilities: {
        createMany: {
          data: [
            { weekday: 1, startMinutes: 0, endMinutes: 1440 },
            { weekday: 2, startMinutes: 0, endMinutes: 1440 },
            { weekday: 3, startMinutes: 0, endMinutes: 1440 },
            { weekday: 4, startMinutes: 0, endMinutes: 1440 },
            { weekday: 5, startMinutes: 0, endMinutes: 1440 },
            { weekday: 6, startMinutes: 0, endMinutes: 1440 },
          ],
        },
      },
    },
  });
}

test("admin insere consulta real para cliente cadastrado", async () => {
  const { createRegisteredAppointment } = await loadAdminAppointmentHelpers();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [admin, therapist, client] = await Promise.all([
    prisma.user.create({ data: { name: "Admin Agenda", email: `admin-agenda-${suffix}@test.local`, passwordHash: "hash", role: "ADMIN" } }),
    prisma.user.create({ data: { name: "Terapeuta Agenda", email: `therapist-agenda-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
    prisma.user.create({ data: { name: "Cliente Agenda", email: `client-agenda-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
  ]);

  try {
    await createOpenAvailability(therapist.id);

    const appointment = await createRegisteredAppointment({
      createdById: admin.id,
      clientId: client.id,
      therapistId: therapist.id,
      startAt: new Date("2030-02-01T13:00:00.000Z"),
      durationMinutes: 50,
      note: "Inserção manual.",
    });

    const request = await prisma.appointmentRequest.findUniqueOrThrow({ where: { id: appointment.requestId } });

    assert.equal(appointment.clientId, client.id);
    assert.equal(appointment.therapistId, therapist.id);
    assert.equal(appointment.status, AppointmentStatus.CONFIRMED);
    assert.equal(request.status, "CONFIRMED");
  } finally {
    await prisma.appointment.deleteMany({ where: { clientId: client.id } });
    await prisma.appointmentRequest.deleteMany({ where: { clientId: client.id } });
    await prisma.user.deleteMany({ where: { id: { in: [admin.id, therapist.id, client.id] } } });
  }
});

test("pré-cadastro é vinculado depois ao usuário correto e cria consulta real", async () => {
  const { createPreRegisteredAppointment, linkPreRegistrationToClient } = await loadAdminAppointmentHelpers();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [admin, therapist, client] = await Promise.all([
    prisma.user.create({ data: { name: "Admin Pré", email: `admin-pre-${suffix}@test.local`, passwordHash: "hash", role: "ADMIN" } }),
    prisma.user.create({ data: { name: "Terapeuta Pré", email: `therapist-pre-${suffix}@test.local`, passwordHash: "hash", role: "THERAPIST" } }),
    prisma.user.create({ data: { name: "Cliente Correto", email: `client-pre-${suffix}@test.local`, passwordHash: "hash", role: "CLIENT" } }),
  ]);

  try {
    await createOpenAvailability(therapist.id);

    const draft = await createPreRegisteredAppointment({
      createdById: admin.id,
      therapistId: therapist.id,
      name: "Pessoa em pré-cadastro",
      email: `draft-${suffix}@test.local`,
      phone: "11999999999",
      startAt: new Date("2030-03-01T14:00:00.000Z"),
      durationMinutes: 60,
      note: "Aguardando autocadastro.",
    });

    const linked = await linkPreRegistrationToClient({
      preRegistrationId: draft.preRegistrationId,
      clientId: client.id,
      linkedById: admin.id,
    });

    const preRegistration = await prisma.preRegistration.findUniqueOrThrow({ where: { id: draft.preRegistrationId } });
    const provisional = await prisma.preRegisteredAppointment.findUniqueOrThrow({ where: { id: draft.id } });

    assert.equal(preRegistration.linkedUserId, client.id);
    assert.equal(linked.appointments.length, 1);
    assert.equal(linked.appointments[0].clientId, client.id);
    assert.equal(provisional.linkedAppointmentId, linked.appointments[0].id);
  } finally {
    await prisma.preRegisteredAppointment.deleteMany({ where: { therapistId: therapist.id } });
    await prisma.preRegistration.deleteMany({ where: { createdById: admin.id } });
    await prisma.appointment.deleteMany({ where: { clientId: client.id } });
    await prisma.appointmentRequest.deleteMany({ where: { clientId: client.id } });
    await prisma.user.deleteMany({ where: { id: { in: [admin.id, therapist.id, client.id] } } });
  }
});
