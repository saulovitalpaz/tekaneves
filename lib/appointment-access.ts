import { AppointmentStatus } from "@prisma/client";

import type { SafeUser } from "@/lib/auth/session";

type ManagedRole = Pick<SafeUser, "id" | "role">;
type AppointmentStatusValue = `${AppointmentStatus}`;
type TransitionInput = { currentStatus: AppointmentStatusValue; nextStatus: "COMPLETED" | "CANCELLED"; hasSummary: boolean };

export function managedAppointmentWhere(user: ManagedRole, id: string) {
  if (user.role === "ADMIN") return { id };
  if (user.role === "THERAPIST") return { id, therapistId: user.id };
  return null;
}

export function validateAppointmentStatusTransition(input: TransitionInput) {
  if (input.currentStatus !== "CONFIRMED") {
    return { ok: false as const, code: "INVALID_STATUS_TRANSITION", message: "Somente consultas confirmadas podem ser concluídas ou canceladas." };
  }
  if (input.nextStatus === "CANCELLED" && input.hasSummary) {
    return { ok: false as const, code: "SUMMARY_EXISTS", message: "Remova o resumo privado antes de cancelar esta consulta." };
  }
  return { ok: true as const };
}
