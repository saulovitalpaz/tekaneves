import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiData, apiError } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Informe email e senha.", 400);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return apiError("INVALID_CREDENTIALS", "Email ou senha inválidos.", 401);

  await createSession(user.id);
  return apiData({ id: user.id, name: user.name, email: user.email, role: user.role });
}
