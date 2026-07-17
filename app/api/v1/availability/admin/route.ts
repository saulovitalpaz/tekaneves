import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { availabilitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);
  const parsed = availabilitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira o intervalo de atendimento.", 400);
  const profile = await prisma.therapistProfile.findFirst({ where: { userId: parsed.data.therapistId } });
  if (!profile || (user.role === "THERAPIST" && profile.userId !== user.id)) return apiError("NOT_FOUND", "Terapeuta não encontrado.", 404);
  const created = await prisma.availability.create({ data: { therapistProfileId: profile.id, weekday: parsed.data.weekday, startMinutes: parsed.data.startMinutes, endMinutes: parsed.data.endMinutes, timezone: parsed.data.timezone, isActive: parsed.data.isActive } });
  return apiData({ id: created.id }, 201);
}
