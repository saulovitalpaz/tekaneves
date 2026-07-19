import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ensureTherapistSlotIsBookable, isSlotErrorCode, slotErrorMessage } from "@/lib/scheduling";
import { appointmentRequestSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar solicitações.", 401);
  const where = user.role === "CLIENT" ? { clientId: user.id } : user.role === "THERAPIST" ? { therapistId: user.id } : {};
  const requests = await prisma.appointmentRequest.findMany({ where, include: { client: { select: { id: true, name: true, email: true } }, therapist: { select: { id: true, name: true } } }, orderBy: { desiredStart: "asc" } });
  return apiData({ requests });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CLIENT") return apiError("FORBIDDEN", "Apenas clientes podem solicitar horários.", user ? 403 : 401);
  const parsed = appointmentRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira os dados da solicitação.", 400);
  if (parsed.data.desiredStart <= new Date()) return apiError("PAST_DATE", "Escolha uma data futura.", 400);

  const therapist = await prisma.user.findFirst({ where: { id: parsed.data.therapistId, role: "THERAPIST" } });
  if (!therapist) return apiError("THERAPIST_NOT_FOUND", "Terapeuta não encontrado.", 404);
  try {
    await ensureTherapistSlotIsBookable({ therapistId: therapist.id, startAt: parsed.data.desiredStart, durationMinutes: parsed.data.durationMinutes });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SLOT_UNAVAILABLE";
    if (isSlotErrorCode(code)) return apiError(code, slotErrorMessage(code), 409);
    throw error;
  }

  const created = await prisma.appointmentRequest.create({ data: { clientId: user.id, therapistId: therapist.id, desiredStart: parsed.data.desiredStart, durationMinutes: parsed.data.durationMinutes, message: parsed.data.message } });
  return apiData({ id: created.id, status: created.status }, 201);
}
