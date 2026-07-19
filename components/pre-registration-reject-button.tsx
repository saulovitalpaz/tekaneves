"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PreRegistrationRejectButton({ preRegistrationId }: { preRegistrationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function reject() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/v1/admin/pre-registrations/${preRegistrationId}/reject`, { method: "PATCH" });
    setPending(false);

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error?.message ?? "Não foi possível rejeitar.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="pre-registration-secondary-action">
      <button className="decision-button decline" type="button" onClick={() => void reject()} disabled={pending}>
        {pending ? "Rejeitando..." : "Rejeitar pré-cadastro"}
      </button>
      {error && <small className="auth-error">{error}</small>}
    </div>
  );
}
