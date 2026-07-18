import { ContactRequestForm } from "@/components/contact-request-form";
import { HomepageInquiryList } from "@/components/homepage-inquiry-list";
import { MessageList } from "@/components/message-list";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { listInternalInbox, listTekaAdminInbox } from "@/lib/internal-messages";

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const [messages, homepageInquiries] = await Promise.all([
    user.role === "ADMIN" ? listTekaAdminInbox() : listInternalInbox(user.id),
    prisma.homepageInquiry.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return <div><div className="portal-heading"><div><p className="eyebrow">Contato assíncrono</p><h1 className="display-font">Mensagens de clientes</h1><p>Os contatos pela homepage e as mensagens de pacientes ficam separados.</p></div></div><div className="admin-inbox-layout"><section className="portal-panel admin-inbox-homepage"><div className="panel-heading"><div><p className="eyebrow">Homepage</p><h2 className="display-font">Contatos pelo site</h2></div></div><HomepageInquiryList inquiries={homepageInquiries} /></section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Pacientes</p><h2 className="display-font">Retornos recentes</h2></div></div><MessageList messages={messages} /></section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Pacientes</p><h2 className="display-font">Responder cliente</h2></div></div>{messages[0]?.sender ? <ContactRequestForm recipientId={messages[0].sender.id} compact /> : <div className="empty-state"><h3>Nenhum cliente para responder</h3><p>As mensagens de pacientes aparecerão nesta área.</p></div>}</section></div></div>;
}
