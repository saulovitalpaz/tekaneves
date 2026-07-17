"use client";

import { FormEvent, useState } from "react";

type ContactRequestFormProps = { recipientId: string; appointmentRequestId?: string; appointmentId?: string; compact?: boolean };

export function ContactRequestForm({ recipientId, appointmentRequestId, appointmentId, compact = false }: ContactRequestFormProps) {
  const [subject, setSubject] = useState(appointmentRequestId ? "Sobre minha solicitação" : "Retorno sobre atendimento");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);
    const response = await fetch("/api/v1/contact-messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId, appointmentRequestId, appointmentId, subject, body }) });
    const result = await response.json();
    if (!response.ok) { setError(true); setFeedback(result.error?.message ?? "Não foi possível enviar a mensagem."); return; }
    setBody("");
    setFeedback("Mensagem enviada. O retorno aparecerá nesta área.");
  }

  return <form className={compact ? "message-form compact" : "message-form"} onSubmit={submit}><input value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={120} aria-label="Assunto" /><textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={2000} placeholder="Escreva uma mensagem breve." aria-label="Mensagem" />{feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}<button className="button-primary" type="submit">Enviar retorno</button></form>;
}
