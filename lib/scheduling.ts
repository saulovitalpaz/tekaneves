import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AvailabilityWindow = {
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  isActive: boolean;
  timezone?: string;
};

export type SlotErrorCode = "SLOT_UNAVAILABLE" | "OUTSIDE_AVAILABILITY";

export function appointmentEnd(startAt: Date, durationMinutes: number) {
  return new Date(startAt.getTime() + durationMinutes * 60 * 1000);
}

const weekdayIndexes: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function timeZoneParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    weekday: weekdayIndexes[value("weekday")],
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

export function isWithinAvailability(startAt: Date, endAt: Date, availability: AvailabilityWindow[]) {
  return availability.some((item) => {
    const timezone = item.timezone ?? "UTC";
    const start = timeZoneParts(startAt, timezone);
    const end = timeZoneParts(endAt, timezone);

    return item.isActive &&
      start.date === end.date &&
      item.weekday === start.weekday &&
      start.minutes >= item.startMinutes &&
      end.minutes <= item.endMinutes;
  });
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
      select: { weekday: true, startMinutes: true, endMinutes: true, isActive: true, timezone: true },
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
