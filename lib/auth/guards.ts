import { redirect } from "next/navigation";
import { getCurrentUser, SafeUser } from "@/lib/auth/session";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireRole(roles: SafeUser["role"][]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/portal");
  return user;
}
