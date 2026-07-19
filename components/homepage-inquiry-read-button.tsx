"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomepageInquiryReadButton({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function markAsRead() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/v1/admin/homepage-inquiries/${inquiryId}/read`, { method: "PATCH" });
    setPending(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error?.message ?? "Não foi possível marcar como lido.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="homepage-inquiry-actions">
      <button className="decision-button propose" type="button" onClick={() => void markAsRead()} disabled={pending}>
        {pending ? "Marcando..." : "Marcar como lido"}
      </button>
      {error && <small className="auth-error">{error}</small>}
    </div>
  );
}
