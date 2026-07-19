import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AvailabilityWindow = {
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  isActive: boolean;
};

export type SlotErrorCode = "SLOT_UNAVAILABLE" | "OUTSIDE_AVAILABILITY";

export function appointmentEnd(startAt: Date, durationMinutes: number) {
  return new Date(startAt.getTime() + durationMinutes * 60 * 1000);
}

function utcMinutes(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function isWithinAvailability(startAt: Date, endAt: Date, availability: AvailabilityWindow[]) {
  if (startAt.getUTCDay() !== endAt.getUTCDay()) return false;

  const weekday = startAt.getUTCDay();
  const startMinutes = utcMinutes(startAt);
  const endMinutes = utcMinutes(endAt);

  return availability.some((item) => (
    item.isActive &&
    item.weekday === weekday &&
    startMinutes >= item.startMinutes &&
    endMinutes <= item.endMinutes
  ));
}

export function isSlotErrorCode(value: string): value is SlotErrorCode {
  return value === "SLOT_UNAVAILABLE" || value === "OUTSIDE_AVAILABILITY";
}

export function slotErrorMessage(code: SlotErrorCode) {
  return {
    SLOT_UNAVAILABLE: "Já existe atendimento nesse horário para essa psicanalista.",
    OUTSIDE_AVAILABILITY: "Esse horário está fora da disponibilidade cadastrada da psicanalista.",
  }[code];
}

export async function ensureTherapistSlotIsBookable(input: {
  therapistId: string;
  startAt: Date;
  durationMinutes: number;
  excludeAppointmentId?: string;
}) {
  const endAt = appointmentEnd(input.startAt, input.durationMinutes);
  const [availability, appointmentConflict, preRegistrationConflict] = await Promise.all([
    prisma.availability.findMany({
      where: { therapistProfile: { userId: input.therapistId }, isActive: true },
      select: { weekday: true, startMinutes: true, endMinutes: true, isActive: true },
    }),
    prisma.appointment.findFirst({
      where: {
        therapistId: input.therapistId,
        status: AppointmentStatus.CONFIRMED,
        startAt: { lt: endAt },
        endAt: { gt: input.startAt },
        ...(input.excludeAppointmentId ? { NOT: { id: input.excludeAppointmentId } } : {}),
      },
      select: { id: true },
    }),
    prisma.preRegisteredAppointment.findFirst({
      where: {
        therapistId: input.therapistId,
        status: AppointmentStatus.CONFIRMED,
        linkedAppointmentId: null,
        preRegistration: { rejectedAt: null },
        startAt: { lt: endAt },
        endAt: { gt: input.startAt },
      },
      select: { id: true },
    }),
  ]);

  if (!isWithinAvailability(input.startAt, endAt, availability)) throw new Error("OUTSIDE_AVAILABILITY");
  if (appointmentConflict || preRegistrationConflict) throw new Error("SLOT_UNAVAILABLE");

  return { endAt };
}
