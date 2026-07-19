"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { toIsoDateTime } from "@/lib/date-time";

export function AppointmentDecisionForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [proposed, setProposed] = useState("");
  const [error, setError] = useState("");

  async function decide(status: "CONFIRMED" | "DECLINED" | "PROPOSED") {
    setError("");
    const response = await fetch(`/api/v1/appointment-requests/${requestId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, confirmedStart: proposed ? toIsoDateTime(proposed) : undefined, adminNote: note || undefined }) });
    if (!response.ok) { const result = await response.json(); setError(result.error?.message ?? "Não foi possível atualizar."); return; }
    router.refresh();
  }

  return <form className="decision-form" onSubmit={(event) => { event.preventDefault(); void decide("CONFIRMED"); }}><input type="datetime-local" value={proposed} onChange={(event) => setProposed(event.target.value)} aria-label="Horário confirmado ou proposto" /><input type="text" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nota opcional" aria-label="Nota administrativa" /><div><button type="submit" className="decision-button confirm">Confirmar</button><button type="button" className="decision-button propose" onClick={() => void decide("PROPOSED")}>Propor horário</button><button type="button" className="decision-button decline" onClick={() => void decide("DECLINED")}>Recusar</button></div>{error && <small className="auth-error">{error}</small>}</form>;
}
