import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { linkPreRegistrationToClient } from "@/lib/admin-appointments";
import { preRegistrationLinkSchema } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const parsed = preRegistrationLinkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Escolha um cliente cadastrado.", 400);

  const { id } = await context.params;
  try {
    const result = await linkPreRegistrationToClient({ preRegistrationId: id, clientId: parsed.data.clientId, linkedById: user.id });
    return apiData({ preRegistrationId: result.preRegistration.id, appointments: result.appointments.map((appointment) => appointment.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível vincular o pré-cadastro.";
    return apiError(message, message, 400);
  }
}
