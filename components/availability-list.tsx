"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityForm } from "@/components/availability-form";

type AvailabilityItem = {
  id: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  timezone: string;
  isActive: boolean;
};

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

export function AvailabilityList({ therapistId, items }: { therapistId: string; items: AvailabilityItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  async function remove(id: string) {
    const response = await fetch(`/api/v1/availability/admin/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error?.message ?? "Não foi possível excluir.");
      return;
    }
    setError("");
    router.refresh();
  }

  return (
    <div className="availability-list">
      {items.map((item) => (
        <div className="availability-item" key={item.id}>
          <span>{weekdays[item.weekday]} • {formatMinutes(item.startMinutes)} às {formatMinutes(item.endMinutes)}</span>
          <div className="availability-actions">
            <button type="button" className="decision-button propose" onClick={() => setEditingId(item.id)}>Editar</button>
            <button type="button" className="decision-button decline" onClick={() => void remove(item.id)}>Excluir</button>
          </div>
          {editingId === item.id && <AvailabilityForm therapistId={therapistId} availability={item} onDone={() => setEditingId("")} />}
        </div>
      ))}
      {error && <small className="auth-error">{error}</small>}
    </div>
  );
}
