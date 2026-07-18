"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AppointmentSummaryForm({ appointmentId, initialBody, status }: { appointmentId: string; initialBody: string; status: "CONFIRMED" | "COMPLETED" }) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/v1/appointments/${appointmentId}/summary`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    if (!response.ok) {
      setError((await response.json()).error?.message ?? "Não foi possível salvar o resumo.");
      return;
    }
    setError("");
    router.refresh();
  }

  async function updateStatus(nextStatus: "COMPLETED" | "CANCELLED") {
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
      <div>
        <button type="submit" className="decision-button confirm">Salvar resumo</button>
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
