"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AppointmentProposalActionsProps = {
  requestId: string;
  therapistId: string;
  proposedStart: Date;
};

export function AppointmentProposalActions({ requestId, therapistId, proposedStart }: AppointmentProposalActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const confirmedPayload = { status: "CONFIRMED" as const };
  const declinedPayload = { status: "DECLINED" as const };

  async function updateRequest(payload: typeof confirmedPayload | typeof declinedPayload) {
    const response = await fetch(`/api/v1/appointment-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error?.message ?? "Não foi possível responder à proposta.");
    }
  }

  async function accept() {
    setError("");
    try {
      await updateRequest(confirmedPayload);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível confirmar.");
    }
  }

  async function decline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const messageResponse = await fetch("/api/v1/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: therapistId,
          appointmentRequestId: requestId,
          subject: "Sobre o horário proposto",
          body: message,
        }),
      });
      if (!messageResponse.ok) {
        const result = await messageResponse.json();
        throw new Error(result.error?.message ?? "Não foi possível enviar a mensagem.");
      }
      await updateRequest(declinedPayload);
      setIsOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível recusar.");
    }
  }

  return (
    <div className="proposal-actions">
      <span>{proposedStart.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span>
      <button className="decision-button confirm" type="button" onClick={() => void accept()}>Aceitar</button>
      <button className="decision-button decline" type="button" onClick={() => setIsOpen(true)}>Recusar</button>
      {error && <small className="auth-error">{error}</small>}
      {isOpen && (
        <div className="proposal-dialog-backdrop">
          <form className="proposal-dialog" onSubmit={decline}>
            <h3>Mensagem para recusar a proposta</h3>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={2000} aria-label="Mensagem de recusa" />
            <div>
              <button className="button-secondary" type="button" onClick={() => setIsOpen(false)}>Voltar</button>
              <button className="button-primary" type="submit">Enviar e recusar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
