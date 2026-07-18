"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AvailabilityValues = {
  id?: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  timezone: string;
  isActive: boolean;
};

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function AvailabilityForm({ therapistId, availability, onDone }: { therapistId: string; availability?: AvailabilityValues; onDone?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const method = availability ? "PATCH" : "POST";
    const url = availability ? `/api/v1/availability/admin/${availability.id}` : "/api/v1/availability/admin";
    const payload = {
      weekday: Number(form.get("weekday")),
      startMinutes: timeToMinutes(String(form.get("start"))),
      endMinutes: timeToMinutes(String(form.get("end"))),
      timezone: "America/Sao_Paulo",
      isActive: availability?.isActive ?? true,
      ...(availability ? {} : { therapistId }),
    };
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "Não foi possível salvar.");
      return;
    }
    if (!availability) event.currentTarget.reset();
    setError("");
    router.refresh();
    onDone?.();
  }

  return (
    <form className="availability-form" onSubmit={submit}>
      <select name="weekday" defaultValue={availability?.weekday ?? 1} aria-label="Dia da semana">
        <option value="1">Segunda</option>
        <option value="2">Terça</option>
        <option value="3">Quarta</option>
        <option value="4">Quinta</option>
        <option value="5">Sexta</option>
      </select>
      <input name="start" type="time" defaultValue={availability ? minutesToTime(availability.startMinutes) : "09:00"} aria-label="Início" />
      <input name="end" type="time" defaultValue={availability ? minutesToTime(availability.endMinutes) : "17:00"} aria-label="Fim" />
      <button className="decision-button confirm" type="submit">{availability ? "Salvar" : "Adicionar"}</button>
      {error && <small className="auth-error">{error}</small>}
    </form>
  );
}
