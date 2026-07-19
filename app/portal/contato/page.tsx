import Link from "next/link";
import { AlertCircle, MessageSquare, Search } from "lucide-react";
import { ContactRequestForm } from "@/components/contact-request-form";
import { MessageList } from "@/components/message-list";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function PortalContactPage(props: { searchParams?: Promise<{ context?: string }> }) {
  const user = await requireUser();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const contextId = searchParams.context;

  const [requests, allMessages] = await Promise.all([
    prisma.appointmentRequest.findMany({ where: { clientId: user.id }, select: { id: true, desiredStart: true, therapist: { select: { id: true, name: true } } }, orderBy: { desiredStart: "desc" } }),
    prisma.contactMessage.findMany({ 
      where: { 
        OR: [{ senderId: user.id }, { recipientId: user.id }]
      }, 
      include: { sender: { select: { name: true } }, recipient: { select: { name: true } } }, 
      orderBy: [{ createdAt: "asc" }, { id: "asc" }]
    }),
  ]);

  const activeContext = contextId ? requests.find(r => r.id === contextId) : null;
  const messages = contextId 
    ? allMessages.filter(m => m.appointmentRequestId === contextId)
    : [];

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <p className="eyebrow">Mensagens</p>
          <h1 className="display-font">Suas conversas</h1>
          <p>Converse com seus terapeutas com segurança e privacidade.</p>
        </div>
        
        <div className="chat-search-wrap">
          <div className="chat-search-input">
            <Search size={16} />
            <input type="text" placeholder="Buscar consulta..." />
          </div>
        </div>

        <div className="chat-warning">
          <AlertCircle />
          <div>
            <strong>Atenção</strong>
            Você pode conversar apenas nos contextos de atendimentos vinculados.
          </div>
        </div>

        <div className="chat-contexts-list">
          <p className="chat-contexts-heading">Contextos de Atendimento</p>
          {requests.map(request => (
            <Link 
              key={request.id} 
              href={`/portal/contato?context=${request.id}`}
              className={`chat-context-item ${contextId === request.id ? 'active' : ''}`}
            >
              <strong>Consulta em {request.desiredStart.toLocaleDateString("pt-BR")}</strong>
              <span>Psicanalista: {request.therapist.name}</span>
            </Link>
          ))}
          {requests.length === 0 && (
            <div style={{ padding: "1rem 1.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
              Nenhuma solicitação de atendimento.
            </div>
          )}
        </div>
      </aside>

      <main className="chat-main">
        {activeContext ? (
          <>
            <div className="chat-main-header">
              <h2>Mensagens com {activeContext.therapist.name}</h2>
            </div>
            <div className="chat-messages-area">
              <MessageList messages={messages} chatMode={true} />
            </div>
            <div className="chat-input-area">
              <ContactRequestForm
                key={activeContext.id}
                recipientId={activeContext.therapist.id}
                appointmentRequestId={activeContext.id}
                chatMode={true}
              />
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">
              <MessageSquare size={32} />
            </div>
            <h3>Nenhuma conversa selecionada</h3>
            <p>Selecione um contexto de atendimento na lista para iniciar ou continuar sua conversa.</p>
          </div>
        )}
      </main>
    </div>
  );
}
