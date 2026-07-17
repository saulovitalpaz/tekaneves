"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AvailabilityForm({ therapistId }: { therapistId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const toMinutes = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; };
    const response = await fetch("/api/v1/availability/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ therapistId, weekday: Number(form.get("weekday")), startMinutes: toMinutes(String(form.get("start"))), endMinutes: toMinutes(String(form.get("end"))), timezone: "America/Sao_Paulo", isActive: true }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error?.message ?? "Não foi possível salvar."); return; }
    event.currentTarget.reset();
    setError("");
    router.refresh();
  }

  return <form className="availability-form" onSubmit={submit}><select name="weekday" defaultValue="1" aria-label="Dia da semana"><option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option></select><input name="start" type="time" defaultValue="09:00" aria-label="Início" /><input name="end" type="time" defaultValue="17:00" aria-label="Fim" /><button className="decision-button confirm" type="submit">Adicionar</button>{error && <small className="auth-error">{error}</small>}</form>;
}
