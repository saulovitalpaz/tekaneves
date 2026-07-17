import { destroySession } from "@/lib/auth/session";
import { apiData } from "@/lib/api";

export async function POST() {
  await destroySession();
  return apiData({ ok: true });
}
