import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { availabilityUpdateSchema } from "@/lib/validation";

async function findManagedAvailability(user: { id: string; role: string }, id: string) {
  if (!["ADMIN", "THERAPIST"].includes(user.role)) return null;
  return prisma.availability.findFirst({
    where: user.role === "ADMIN" ? { id } : { id, therapistProfile: { userId: user.id } },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para editar a disponibilidade.", 401);
  const parsed = availabilityUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o intervalo de atendimento.", 400);
  const { id } = await context.params;
  if (!(await findManagedAvailability(user, id))) return apiError("FORBIDDEN", "Você não pode editar esta disponibilidade.", 403);
  const availability = await prisma.availability.update({ where: { id }, data: parsed.data });
  return apiData({ availability });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para excluir a disponibilidade.", 401);
  const { id } = await context.params;
  if (!(await findManagedAvailability(user, id))) return apiError("FORBIDDEN", "Você não pode excluir esta disponibilidade.", 403);
  await prisma.availability.delete({ where: { id } });
  return apiData({ id });
}
