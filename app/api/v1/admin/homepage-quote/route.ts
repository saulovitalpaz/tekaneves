import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { getHomepageQuoteSettings, updateHomepageQuoteSettings } from "@/lib/homepage-quote";
import { homepageQuoteSettingsSchema } from "@/lib/validation";

function canManageHomepageQuote(user: { role: string } | null) {
  return Boolean(user && ["ADMIN", "THERAPIST"].includes(user.role));
}

export async function GET() {
  const user = await getCurrentUser();
  if (!canManageHomepageQuote(user)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);
  return apiData({ settings: await getHomepageQuoteSettings() });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!canManageHomepageQuote(user)) return apiError("FORBIDDEN", "Acesso administrativo necessário.", user ? 403 : 401);

  const parsed = homepageQuoteSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira a frase e as opções de exibição.", 400);

  const settings = await updateHomepageQuoteSettings(parsed.data);
  return apiData({ settings });
}
