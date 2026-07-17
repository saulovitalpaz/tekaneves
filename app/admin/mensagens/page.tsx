import { ContactRequestForm } from "@/components/contact-request-form";
import { MessageList } from "@/components/message-list";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const messages = await prisma.contactMessage.findMany({ where: { recipientId: user.id }, include: { sender: { select: { id: true, name: true } }, recipient: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return <div><div className="portal-heading"><div><p className="eyebrow">Contato assíncrono</p><h1 className="display-font">Mensagens de clientes</h1><p>Responda aos retornos relacionados à agenda e aos atendimentos.</p></div></div><div className="contact-layout"><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Entrada</p><h2 className="display-font">Retornos recentes</h2></div></div><MessageList messages={messages} /></section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Novo retorno</p><h2 className="display-font">Responder cliente</h2></div></div>{messages[0]?.sender ? <ContactRequestForm recipientId={messages[0].sender.id} compact /> : <div className="empty-state"><h3>Nenhum cliente para responder</h3><p>As mensagens recebidas aparecerão nesta área.</p></div>}</section></div></div>;
}
