import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { createPreRegisteredAppointment, createRegisteredAppointment } from "@/lib/admin-appointments";
import { isSlotErrorCode, slotErrorMessage } from "@/lib/scheduling";
import { adminAppointmentCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const parsed = adminAppointmentCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira os dados do horário.", 400);

  try {
    const result = parsed.data.mode === "REGISTERED"
      ? await createRegisteredAppointment({ ...parsed.data, createdById: user.id })
      : await createPreRegisteredAppointment({ ...parsed.data, createdById: user.id });

    return apiData({ id: result.id }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível inserir o horário.";
    const isSlotError = isSlotErrorCode(message);
    return apiError(message, isSlotError ? slotErrorMessage(message) : message, isSlotError ? 409 : 400);
  }
}
