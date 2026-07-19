import { managedAppointmentWhere } from "@/lib/appointment-access";
import { apiData, apiError } from "@/lib/api";
import { getCurrentUser, type SafeUser } from "@/lib/auth/session";
import { isSummaryEligible, upsertAppointmentSummary } from "@/lib/appointment-summaries";
import { prisma } from "@/lib/db";
import { appointmentSummaryBodySchema } from "@/lib/validation";

async function findManagedAppointment(user: Pick<SafeUser, "id" | "role">, id: string) {
  const where = managedAppointmentWhere(user, id);
  if (!where) return null;
  return prisma.appointment.findFirst({ where, include: { summary: true } });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar o resumo.", 401);
  const { id } = await context.params;
  const appointment = await findManagedAppointment(user, id);
  if (!appointment) return apiError("FORBIDDEN", "Você não pode acessar este resumo.", 403);
  if (!isSummaryEligible(appointment.status)) return apiError("SUMMARY_UNAVAILABLE", "Esta consulta não aceita resumo.", 409);
  return apiData({ summary: appointment.summary });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para registrar o resumo.", 401);
  const parsed = appointmentSummaryBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o resumo do atendimento.", 400);
  const { id } = await context.params;
  const appointment = await findManagedAppointment(user, id);
  if (!appointment) return apiError("FORBIDDEN", "Você não pode alterar este resumo.", 403);
  if (!isSummaryEligible(appointment.status)) return apiError("SUMMARY_UNAVAILABLE", "Esta consulta não aceita resumo.", 409);
  const summary = await upsertAppointmentSummary({ appointmentId: appointment.id, authorId: user.id, body: parsed.data.body, clientNote: parsed.data.clientNote });
  return apiData({ summary });
}
