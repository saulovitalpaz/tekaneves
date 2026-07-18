import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { appointmentDecisionSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST", "CLIENT"].includes(user.role)) return apiError("FORBIDDEN", "Acesso necessário.", user ? 403 : 401);
  const { id } = await context.params;
  const parsed = appointmentDecisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira a decisão e o horário.", 400);
  const requestRecord = await prisma.appointmentRequest.findUnique({ where: { id }, include: { appointment: true } });
  if (!requestRecord || (user.role === "THERAPIST" && requestRecord.therapistId !== user.id) || (user.role === "CLIENT" && requestRecord.clientId !== user.id)) return apiError("NOT_FOUND", "Solicitação não encontrada.", 404);
  if (user.role === "CLIENT" && requestRecord.status !== "PROPOSED") return apiError("FORBIDDEN", "Somente propostas pendentes podem ser respondidas pelo cliente.", 403);
  if (user.role === "CLIENT" && parsed.data.status === "PROPOSED") return apiError("FORBIDDEN", "Cliente não pode propor novo horário por esta ação.", 403);

  if (parsed.data.status === "DECLINED") {
    const updated = await prisma.appointmentRequest.update({ where: { id }, data: { status: "DECLINED", adminNote: parsed.data.adminNote } });
    return apiData({ id: updated.id, status: updated.status });
  }

  const start = parsed.data.confirmedStart ?? requestRecord.proposedStart ?? requestRecord.desiredStart;
  if (parsed.data.status === "PROPOSED") {
    const updated = await prisma.appointmentRequest.update({ where: { id }, data: { status: "PROPOSED", proposedStart: start, adminNote: parsed.data.adminNote } });
    return apiData({ id: updated.id, status: updated.status });
  }

  const end = new Date(start.getTime() + requestRecord.durationMinutes * 60 * 1000);
  const conflict = await prisma.appointment.findFirst({ where: { therapistId: requestRecord.therapistId, status: "CONFIRMED", startAt: { lt: end }, endAt: { gt: start }, NOT: { id: requestRecord.appointment?.id } } });
  if (conflict) return apiError("SLOT_UNAVAILABLE", "Esse horário já está ocupado.", 409);

  const appointment = await prisma.$transaction(async (tx) => {
    await tx.appointmentRequest.update({ where: { id }, data: { status: "CONFIRMED", proposedStart: null, adminNote: parsed.data.adminNote } });
    return requestRecord.appointment ? tx.appointment.update({ where: { id: requestRecord.appointment.id }, data: { startAt: start, endAt: end, status: "CONFIRMED", adminNote: parsed.data.adminNote } }) : tx.appointment.create({ data: { requestId: id, clientId: requestRecord.clientId, therapistId: requestRecord.therapistId, startAt: start, endAt: end, adminNote: parsed.data.adminNote } });
  });
  return apiData({ id: appointment.id, status: "CONFIRMED" });
}
