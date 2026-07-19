import { MessageSquare } from "lucide-react";
import { ContactRequestForm } from "@/components/contact-request-form";
import { HomepageInquiryList } from "@/components/homepage-inquiry-list";
import { MessageList } from "@/components/message-list";
import { AdminChatSidebar } from "@/components/admin-chat-sidebar";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { listClientMessageRecipients, listInternalConversation } from "@/lib/internal-messages";

export default async function AdminMessagesPage(props: { searchParams?: Promise<{ recipient?: string }> | { recipient?: string } }) {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const searchParams = props.searchParams ? await props.searchParams : {};
  const recipientId = searchParams.recipient;

  const [homepageInquiries, clientRecipients] = await Promise.all([
    prisma.homepageInquiry.findMany({ orderBy: [{ readAt: "asc" }, { createdAt: "desc" }] }),
    listClientMessageRecipients(user),
  ]);

  const messages = recipientId ? await listInternalConversation(user.id, recipientId) : [];
  const activeRecipient = recipientId ? clientRecipients.find(c => c.id === recipientId) : null;

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Mensagens</p>
          <h1 className="display-font">Caixa de entrada</h1>
          <p>Acompanhe os contatos da página inicial e converse com seus pacientes.</p>
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <section className="portal-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Homepage</p>
              <h2 className="display-font">Contatos pelo site</h2>
            </div>
          </div>
          <HomepageInquiryList inquiries={homepageInquiries} />
        </section>

        <div className="chat-layout">
          <AdminChatSidebar recipients={clientRecipients} selectedRecipientId={recipientId} />

          <main className="chat-main">
            {activeRecipient ? (
              <>
                <div className="chat-main-header">
                  <h2>Mensagens com {activeRecipient.name}</h2>
                </div>
                <div className="chat-messages-area">
                  <MessageList messages={messages} chatMode={true} />
                </div>
                <div className="chat-input-area">
                  <ContactRequestForm 
                    recipientId={activeRecipient.id} 
                    chatMode={true} 
                  />
                </div>
              </>
            ) : (
              <div className="chat-empty-state">
                <div className="chat-empty-state-icon">
                  <MessageSquare size={32} />
                </div>
                <h3>Selecione um paciente</h3>
                <p>Escolha um contato na lista ao lado para conversar ou acessar o histórico.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
