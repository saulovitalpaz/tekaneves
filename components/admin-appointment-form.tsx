"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ClientOption = { id: string; name: string; email: string };
type TherapistOption = { id: string; name: string };

type AdminAppointmentFormProps = {
  clients: ClientOption[];
  therapists: TherapistOption[];
};

export function AdminAppointmentForm({ clients, therapists }: AdminAppointmentFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"REGISTERED" | "PRE_REGISTERED">("REGISTERED");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  const defaultTherapistId = therapists[0]?.id ?? "";
  const defaultClientId = clients[0]?.id ?? "";
  const canSubmit = Boolean(defaultTherapistId && (mode === "PRE_REGISTERED" || defaultClientId));

  const submitLabel = useMemo(() => mode === "REGISTERED" ? "Inserir consulta" : "Criar pré-cadastro", [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/v1/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, mode, durationMinutes: Number(payload.durationMinutes ?? 50) }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(true);
      setFeedback(result.error?.message ?? "Não foi possível inserir o horário.");
      return;
    }

    event.currentTarget.reset();
    setFeedback(mode === "REGISTERED" ? "Consulta inserida na agenda." : "Pré-cadastro criado para vínculo posterior.");
    router.refresh();
  }

  return (
    <form className="admin-appointment-form" onSubmit={submit}>
      <div className="segmented-control" aria-label="Tipo de inserção">
        <button type="button" className={mode === "REGISTERED" ? "active" : ""} onClick={() => setMode("REGISTERED")}>Cliente cadastrado</button>
        <button type="button" className={mode === "PRE_REGISTERED" ? "active" : ""} onClick={() => setMode("PRE_REGISTERED")}>Pré-cadastro</button>
      </div>
      <label>Terapeuta
        <select name="therapistId" required defaultValue={defaultTherapistId}>
          {therapists.map((therapist) => <option key={therapist.id} value={therapist.id}>{therapist.name}</option>)}
        </select>
      </label>
      {mode === "REGISTERED" ? (
        <label>Cliente
          <select name="clientId" required defaultValue={defaultClientId}>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name} - {client.email}</option>)}
          </select>
        </label>
      ) : (
        <>
          <label>Nome<input name="name" required minLength={2} /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>Telefone<input name="phone" /></label>
        </>
      )}
      <label>Início<input name="startAt" type="datetime-local" required /></label>
      <label>Duração
        <select name="durationMinutes" defaultValue="50">
          <option value="30">30 min</option>
          <option value="50">50 min</option>
          <option value="60">60 min</option>
          <option value="90">90 min</option>
        </select>
      </label>
      <label>Nota<textarea name="note" maxLength={1000} placeholder="Contexto administrativo opcional." /></label>
      {feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}
      <button className="button-primary" type="submit" disabled={!canSubmit}>{submitLabel}</button>
    </form>
  );
}
