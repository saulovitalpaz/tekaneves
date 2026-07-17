import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar horários.", 401);
  const therapists = await prisma.user.findMany({ where: { role: "THERAPIST" }, select: { id: true, name: true, therapistProfile: { select: { specialty: true, availabilities: { where: { isActive: true }, orderBy: { weekday: "asc" } } } } }, orderBy: { name: "asc" } });
  return apiData({ therapists });
}
