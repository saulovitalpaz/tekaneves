"use client";

import { FormEvent, useState } from "react";
import { submitAppointmentRequest } from "@/lib/appointment-request-client";

type Therapist = { id: string; name: string; specialty: string | null };

export function AppointmentRequestForm({ therapists }: { therapists: Therapist[] }) {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);
    const form = new FormData(event.currentTarget);
    const result = await submitAppointmentRequest({ therapistId: form.get("therapistId"), desiredStart: form.get("desiredStart"), durationMinutes: Number(form.get("durationMinutes")), message });
    if (!result.ok) { setError(true); setFeedback(result.message); return; }
    setMessage("");
    event.currentTarget.reset();
    setFeedback("Solicitação enviada. Você poderá acompanhar a confirmação em Consultas.");
  }

  return <form className="portal-form" onSubmit={submit}><label>Terapeuta<select name="therapistId" required defaultValue=""><option value="" disabled>Selecione um terapeuta</option>{therapists.map((therapist) => <option key={therapist.id} value={therapist.id}>{therapist.name}{therapist.specialty ? ` • ${therapist.specialty}` : ""}</option>)}</select></label><label>Data e horário desejados<input name="desiredStart" type="datetime-local" required /></label><label>Duração<select name="durationMinutes" defaultValue="50"><option value="50">50 minutos</option><option value="60">60 minutos</option><option value="90">90 minutos</option></select></label><label>Mensagem breve<textarea name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} required placeholder="Conte o que gostaria de cuidar neste momento." /></label>{feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}<button className="button-primary" type="submit">Solicitar atendimento</button></form>;
}
