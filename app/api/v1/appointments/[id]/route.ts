import { managedAppointmentWhere, validateAppointmentStatusTransition } from "@/lib/appointment-access";
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { appointmentStatusUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);
  const parsed = appointmentStatusUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o novo estado da consulta.", 400);
  const { id } = await context.params;
  const where = managedAppointmentWhere(user, id);
  if (!where) return apiError("FORBIDDEN", "Você não pode alterar esta consulta.", 403);
  const appointment = await prisma.appointment.findFirst({ where, include: { summary: { select: { id: true } } } });
  if (!appointment) return apiError("FORBIDDEN", "Você não pode alterar esta consulta.", 403);
  const transition = validateAppointmentStatusTransition({ currentStatus: appointment.status, nextStatus: parsed.data.status, hasSummary: Boolean(appointment.summary) });
  if (!transition.ok) return apiError(transition.code, transition.message, 409);
  const updated = await prisma.appointment.update({ where: { id }, data: { status: parsed.data.status } });
  return apiData({ id: updated.id, status: updated.status });
}
