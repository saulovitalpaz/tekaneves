import { apiData, apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { homepageInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = homepageInquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira os campos obrigatórios.", 400);
  const inquiry = await prisma.homepageInquiry.create({ data: parsed.data });
  return apiData({ id: inquiry.id }, 201);
}
