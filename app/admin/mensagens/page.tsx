import { ContactRequestForm } from "@/components/contact-request-form";
import { HomepageInquiryList } from "@/components/homepage-inquiry-list";
import { MessageList } from "@/components/message-list";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { listClientMessageRecipients, listInternalInbox, listTekaAdminInbox } from "@/lib/internal-messages";

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const [messages, homepageInquiries, clientRecipients] = await Promise.all([
    user.role === "ADMIN" ? listTekaAdminInbox() : listInternalInbox(user.id),
    prisma.homepageInquiry.findMany({ orderBy: { createdAt: "desc" } }),
    listClientMessageRecipients(user),
  ]);

  return <div><div className="portal-heading"><div><p className="eyebrow">Contato assíncrono</p><h1 className="display-font">Mensagens de clientes</h1><p>Os contatos pela homepage e as mensagens de pacientes ficam separados.</p></div></div><div className="admin-inbox-layout"><section className="portal-panel admin-inbox-homepage"><div className="panel-heading"><div><p className="eyebrow">Homepage</p><h2 className="display-font">Contatos pelo site</h2></div></div><HomepageInquiryList inquiries={homepageInquiries} /></section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Pacientes</p><h2 className="display-font">Retornos recentes</h2></div></div><MessageList messages={messages} /></section><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Pacientes</p><h2 className="display-font">Enviar mensagem ao paciente</h2></div></div>{clientRecipients.length ? <ContactRequestForm recipients={clientRecipients} compact /> : <div className="empty-state"><h3>Nenhum paciente cadastrado</h3><p>Clientes autocadastrados aparecerão como destinatários nesta área.</p></div>}</section></div></div>;
}
