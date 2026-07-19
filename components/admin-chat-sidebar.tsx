"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Recipient = {
  id: string;
  name: string;
  email: string;
};

type AdminChatSidebarProps = {
  recipients: Recipient[];
  selectedRecipientId?: string;
};

export function AdminChatSidebar({ recipients, selectedRecipientId }: AdminChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <p className="eyebrow">Pacientes</p>
        <h1 className="display-font">Contatos</h1>
        <p>Selecione um paciente para ver o histórico e enviar mensagens.</p>
      </div>
      
      <div className="chat-search-wrap">
        <div className="chat-search-input">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-contexts-list">
        {filteredRecipients.map(recipient => (
          <Link 
            key={recipient.id} 
            href={`/admin/mensagens?recipient=${recipient.id}`}
            className={`chat-context-item ${selectedRecipientId === recipient.id ? 'active' : ''}`}
          >
            <strong>{recipient.name}</strong>
            <span>{recipient.email}</span>
          </Link>
        ))}
        {filteredRecipients.length === 0 && (
          <div style={{ padding: "1rem 1.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
            Nenhum paciente encontrado.
          </div>
        )}
      </div>
    </aside>
  );
}
