import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const { id } = await context.params;
  const result = await prisma.preRegistration.updateMany({
    where: {
      id,
      linkedUserId: null,
      rejectedAt: null,
      ...(user.role === "THERAPIST" ? { appointments: { some: { therapistId: user.id } } } : {}),
    },
    data: { rejectedAt: new Date() },
  });

  if (!result.count) return apiError("PRE_REGISTRATION_NOT_FOUND", "Pré-cadastro pendente não encontrado.", 404);
  return apiData({ id });
}
