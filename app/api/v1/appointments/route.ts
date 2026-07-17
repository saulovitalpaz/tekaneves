import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar sua agenda.", 401);
  const requests = await prisma.appointmentRequest.findMany({ where: { clientId: user.id }, include: { therapist: { select: { id: true, name: true } }, appointment: true }, orderBy: { desiredStart: "desc" } });
  return apiData({ requests });
}
