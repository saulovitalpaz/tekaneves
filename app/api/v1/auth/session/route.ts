import { apiData } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  return apiData({ user: await getCurrentUser() });
}
