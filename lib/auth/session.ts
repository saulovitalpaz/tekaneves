import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "teka_session";
const SESSION_DAYS = 7;

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "THERAPIST" | "CLIENT";
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toSafeUser(user: { id: string; name: string; email: string; role: SafeUser["role"] }): SafeUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  return toSafeUser(session.user);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date() } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function revokeOtherSessions(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await prisma.session.updateMany({
    where: { userId, tokenHash: { not: hashToken(token) } },
    data: { revokedAt: new Date() },
  });
}
