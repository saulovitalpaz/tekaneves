import { prisma } from "@/lib/db";
import { appointmentEnd, ensureTherapistSlotIsBookable } from "@/lib/scheduling";

type RegisteredAppointmentInput = {
  createdById: string;
  clientId: string;
  therapistId: string;
  startAt: Date;
  durationMinutes: number;
  note?: string;
};

type PreRegisteredAppointmentInput = {
  createdById: string;
  therapistId: string;
  name: string;
  email?: string;
  phone?: string;
  startAt: Date;
  durationMinutes: number;
  note?: string;
};

type LinkPreRegistrationInput = {
  preRegistrationId: string;
  clientId: string;
  linkedById: string;
};

async function assertClient(clientId: string) {
  const client = await prisma.user.findFirst({ where: { id: clientId, role: "CLIENT" } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");
  return client;
}

async function assertTherapist(therapistId: string) {
  const therapist = await prisma.user.findFirst({ where: { id: therapistId, role: { in: ["THERAPIST", "ADMIN"] } } });
  if (!therapist) throw new Error("THERAPIST_NOT_FOUND");
  return therapist;
}

export async function createRegisteredAppointment(input: RegisteredAppointmentInput) {
  await Promise.all([assertClient(input.clientId), assertTherapist(input.therapistId)]);
  const { endAt } = await ensureTherapistSlotIsBookable(input);

  return prisma.$transaction(async (tx) => {
    const request = await tx.appointmentRequest.create({
      data: {
        clientId: input.clientId,
        therapistId: input.therapistId,
        desiredStart: input.startAt,
        durationMinutes: input.durationMinutes,
        message: input.note ?? "Atendimento inserido manualmente.",
        adminNote: input.note,
        status: "CONFIRMED",
      },
    });

    return tx.appointment.create({
      data: {
        requestId: request.id,
        clientId: input.clientId,
        therapistId: input.therapistId,
        startAt: input.startAt,
        endAt,
        adminNote: input.note,
      },
    });
  });
}

export async function createPreRegisteredAppointment(input: PreRegisteredAppointmentInput) {
  await assertTherapist(input.therapistId);
  const { endAt } = await ensureTherapistSlotIsBookable(input);

  return prisma.$transaction(async (tx) => {
    const preRegistration = await tx.preRegistration.create({
      data: {
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        note: input.note,
        createdById: input.createdById,
      },
    });

    return tx.preRegisteredAppointment.create({
      data: {
        preRegistrationId: preRegistration.id,
        therapistId: input.therapistId,
        createdById: input.createdById,
        startAt: input.startAt,
        endAt,
        durationMinutes: input.durationMinutes,
        note: input.note,
      },
    });
  });
}

export async function linkPreRegistrationToClient(input: LinkPreRegistrationInput) {
  await assertClient(input.clientId);
  const preRegistration = await prisma.preRegistration.findUnique({
    where: { id: input.preRegistrationId },
    include: { appointments: { where: { linkedAppointmentId: null }, orderBy: { startAt: "asc" } } },
  });
  if (!preRegistration) throw new Error("PRE_REGISTRATION_NOT_FOUND");
  if (preRegistration.rejectedAt) throw new Error("PRE_REGISTRATION_REJECTED");

  return prisma.$transaction(async (tx) => {
    await tx.preRegistration.update({
      where: { id: input.preRegistrationId },
      data: { linkedUserId: input.clientId },
    });

    const appointments = [];
    for (const provisional of preRegistration.appointments) {
      const request = await tx.appointmentRequest.create({
        data: {
          clientId: input.clientId,
          therapistId: provisional.therapistId,
          desiredStart: provisional.startAt,
          durationMinutes: provisional.durationMinutes,
          message: provisional.note ?? "Atendimento vinculado a pré-cadastro.",
          adminNote: provisional.note,
          status: "CONFIRMED",
        },
      });
      const appointment = await tx.appointment.create({
        data: {
          requestId: request.id,
          clientId: input.clientId,
          therapistId: provisional.therapistId,
          startAt: provisional.startAt,
          endAt: provisional.endAt,
          adminNote: provisional.note,
        },
      });
      await tx.preRegisteredAppointment.update({
        where: { id: provisional.id },
        data: { clientId: input.clientId, linkedAppointmentId: appointment.id },
      });
      appointments.push(appointment);
    }

    return { preRegistration: { ...preRegistration, linkedUserId: input.clientId }, appointments };
  });
}
