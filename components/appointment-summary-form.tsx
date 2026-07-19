"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AppointmentSummaryForm({ appointmentId, initialBody, initialClientNote, status }: { appointmentId: string; initialBody: string; initialClientNote?: string; status: "CONFIRMED" | "COMPLETED" }) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [clientNote, setClientNote] = useState(initialClientNote ?? "");
  const [showNote, setShowNote] = useState(!!initialClientNote);
  const [error, setError] = useState("");

  async function save(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    if (!body.trim()) {
      setError("Escreva um resumo breve antes de salvar.");
      return false;
    }
    const response = await fetch(`/api/v1/appointments/${appointmentId}/summary`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, clientNote: clientNote.trim() || undefined }) });
    if (!response.ok) {
      setError((await response.json()).error?.message ?? "Não foi possível salvar o resumo.");
      return false;
    }
    setError("");
    if (event) router.refresh();
    return true;
  }

  async function updateStatus(nextStatus: "COMPLETED" | "CANCELLED") {
    if (nextStatus === "COMPLETED" && body.trim()) {
      const saved = await save();
      if (!saved) return;
    }
    const response = await fetch(`/api/v1/appointments/${appointmentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) {
      setError((await response.json()).error?.message ?? "Não foi possível atualizar a consulta.");
      return;
    }
    setError("");
    router.refresh();
  }

  return (
    <form className="appointment-summary-form" onSubmit={save}>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Resumo privado do atendimento" aria-label="Resumo privado do atendimento" />
      
      {showNote && (
        <textarea value={clientNote} onChange={(event) => setClientNote(event.target.value)} maxLength={4000} placeholder="Nota ao cliente (visível para o paciente)" aria-label="Nota ao cliente" style={{ marginTop: "0.75rem", backgroundColor: "var(--paper-deep)" }} />
      )}
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        <button type="submit" className="decision-button confirm">Salvar resumo</button>
        {!showNote && (
          <button type="button" className="decision-button propose" onClick={() => setShowNote(true)}>+ Adicionar nota ao cliente</button>
        )}
        {status === "CONFIRMED" && (
          <>
            <button type="button" className="decision-button propose" onClick={() => void updateStatus("COMPLETED")}>Concluir consulta</button>
            <button type="button" className="decision-button decline" onClick={() => void updateStatus("CANCELLED")}>Cancelar</button>
          </>
        )}
      </div>
      {error && <small className="auth-error">{error}</small>}
    </form>
  );
}
