import { ContactRequestForm } from "@/components/contact-request-form";
import { MessageList } from "@/components/message-list";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { getPrimaryTherapist } from "@/lib/primary-therapist";

export default async function PortalContactPage() {
  const user = await requireUser();
  const [therapist, requests, messages] = await Promise.all([
    getPrimaryTherapist(),
    prisma.appointmentRequest.findMany({ where: { clientId: user.id }, select: { id: true, desiredStart: true, therapist: { select: { name: true } } }, orderBy: { desiredStart: "desc" } }),
    prisma.contactMessage.findMany({ where: { OR: [{ senderId: user.id }, { recipientId: user.id }] }, include: { sender: { select: { name: true } }, recipient: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return <div><div className="portal-heading"><div><p className="eyebrow">Contato</p><h1 className="display-font">Um retorno quando você precisar.</h1><p>Envie uma mensagem breve sobre sua solicitação ou consulta. O contato é assíncrono e focado no cuidado.</p></div></div><div className="contact-layout"><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Nova mensagem</p><h2 className="display-font">Falar com a terapeuta</h2></div></div>{therapist ? <ContactRequestForm recipientId={therapist.id} /> : <p className="form-feedback error">Nenhuma terapeuta disponível no momento.</p>}</section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2 className="display-font">Mensagens</h2></div></div><MessageList messages={messages} /></section></div>{requests.length > 0 && <section className="portal-panel" style={{ marginTop: "1.5rem" }}><p className="eyebrow">Contexto de atendimento</p><div className="context-list">{requests.map((request) => <span key={request.id}>{request.therapist.name} • {request.desiredStart.toLocaleDateString("pt-BR")}</span>)}</div></section>}</div>;
}
