import { apiData, apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { contactMessageSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para consultar mensagens.", 401);
  const messages = await prisma.contactMessage.findMany({ where: { OR: [{ senderId: user.id }, { recipientId: user.id }] }, include: { sender: { select: { id: true, name: true } }, recipient: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } });
  return apiData({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHENTICATED", "Entre para enviar uma mensagem.", 401);
  const parsed = contactMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Confira assunto e mensagem.", 400);
  const recipient = await prisma.user.findUnique({ where: { id: parsed.data.recipientId } });
  if (!recipient || recipient.id === user.id) return apiError("RECIPIENT_NOT_FOUND", "Destinatário inválido.", 404);

  if (user.role === "CLIENT" && recipient.role !== "THERAPIST" && recipient.role !== "ADMIN") return apiError("FORBIDDEN", "Você só pode contatar a equipe de atendimento.", 403);
  if (parsed.data.appointmentRequestId) {
    const appointmentRequest = await prisma.appointmentRequest.findUnique({ where: { id: parsed.data.appointmentRequestId } });
    if (!appointmentRequest || (user.role === "CLIENT" && appointmentRequest.clientId !== user.id) || (user.role === "THERAPIST" && appointmentRequest.therapistId !== user.id)) return apiError("FORBIDDEN", "Mensagem sem vínculo permitido.", 403);
  }
  const message = await prisma.contactMessage.create({ data: { senderId: user.id, recipientId: recipient.id, appointmentRequestId: parsed.data.appointmentRequestId, appointmentId: parsed.data.appointmentId, subject: parsed.data.subject, body: parsed.data.body } });
  return apiData({ id: message.id }, 201);
}
