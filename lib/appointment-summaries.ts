import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export const SUMMARY_ELIGIBLE_STATUSES = [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] as const;

export function isSummaryEligible(status: AppointmentStatus) {
  return SUMMARY_ELIGIBLE_STATUSES.includes(status as (typeof SUMMARY_ELIGIBLE_STATUSES)[number]);
}

export async function upsertAppointmentSummary(input: { appointmentId: string; authorId: string; body: string; clientNote?: string | null }) {
  return prisma.appointmentSummary.upsert({
    where: { appointmentId: input.appointmentId },
    create: input,
    update: { body: input.body, clientNote: input.clientNote },
  });
}
