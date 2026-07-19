import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "THERAPIST"].includes(user.role)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const { id } = await context.params;
  const inquiry = await prisma.homepageInquiry.update({
    where: { id },
    data: { readAt: new Date() },
    select: { id: true, readAt: true },
  });

  return apiData({ id: inquiry.id, readAt: inquiry.readAt });
}
