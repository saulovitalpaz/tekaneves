import { NextRequest } from "next/server";

import { apiData, apiError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentUser, revokeOtherSessions } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHORIZED", "Faça login para alterar sua senha.", 401);

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira os campos da nova senha.", 400);

  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!account) return apiError("UNAUTHORIZED", "Sessão inválida.", 401);

  const isCurrentPasswordValid = await verifyPassword(parsed.data.currentPassword, account.passwordHash);
  if (!isCurrentPasswordValid) return apiError("INVALID_PASSWORD", "A senha atual está incorreta.", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  await revokeOtherSessions(user.id);

  return apiData({ ok: true });
}
