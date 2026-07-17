import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiData, apiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira seus dados.", 400);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return apiError("EMAIL_IN_USE", "Não foi possível criar a conta com esses dados.", 409);

  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) },
  });
  await createSession(user.id);
  return apiData({ id: user.id, name: user.name, email: user.email, role: user.role }, 201);
}
