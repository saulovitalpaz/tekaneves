"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Send } from "lucide-react";

type RecipientOption = {
  id: string;
  name: string;
  email: string;
};

type ContactRequestFormProps = {
  recipientId?: string;
  recipients?: RecipientOption[];
  appointmentRequestId?: string;
  appointmentId?: string;
  compact?: boolean;
  chatMode?: boolean;
};

export function ContactRequestForm({
  recipientId,
  recipients = [],
  appointmentRequestId,
  appointmentId,
  compact = false,
  chatMode = false,
}: ContactRequestFormProps) {
  const router = useRouter();
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipientId ?? recipients[0]?.id ?? "");
  const [subject, setSubject] = useState(appointmentRequestId ? "Sobre minha solicitação" : "Retorno sobre atendimento");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);

    const response = await fetch("/api/v1/contact-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: selectedRecipientId,
        appointmentRequestId,
        appointmentId,
        subject: chatMode ? "Mensagem do Chat" : subject,
        body,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(true);
      setFeedback(result.error?.message ?? "Não foi possível enviar a mensagem.");
      return;
    }

    setBody("");
    if (!chatMode) setFeedback("Mensagem enviada. O retorno aparecerá nesta área.");
    router.refresh();
  }

  const formClassName = chatMode 
    ? "message-form chat-mode" 
    : compact 
      ? "message-form compact" 
      : "message-form";

  return (
    <form className={formClassName} onSubmit={submit}>
      {!chatMode && recipients.length > 0 && (
        <label className="message-recipient-field">
          <span>Destinatário</span>
          <select value={selectedRecipientId} onChange={(event) => setSelectedRecipientId(event.target.value)} required aria-label="Destinatário">
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name} · {recipient.email}
              </option>
            ))}
          </select>
        </label>
      )}
      
      {!chatMode && (
        <input value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={120} aria-label="Assunto" />
      )}
      
      <div className={chatMode ? "form-inputs" : undefined}>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={2000} placeholder="Digite uma mensagem..." aria-label="Mensagem" />
        {feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}
      </div>

      <button className="button-primary" type="submit" disabled={!selectedRecipientId || !body.trim()}>
        {chatMode ? <Send size={18} /> : "Enviar retorno"}
      </button>
    </form>
  );
}
