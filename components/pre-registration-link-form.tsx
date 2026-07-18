"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ClientOption = { id: string; name: string; email: string };

export function PreRegistrationLinkForm({ preRegistrationId, clients }: { preRegistrationId: string; clients: ClientOption[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/v1/admin/pre-registrations/${preRegistrationId}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: form.get("clientId") }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(true);
      setFeedback(result.error?.message ?? "Não foi possível vincular.");
      return;
    }

    setFeedback("Pré-cadastro vinculado ao cliente.");
    router.refresh();
  }

  if (!clients.length) return <p className="form-feedback error">Nenhum cliente cadastrado para vínculo.</p>;

  return (
    <form className="pre-registration-link-form" onSubmit={submit}>
      <label>Vincular ao cliente
        <select name="clientId" required>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name} - {client.email}</option>)}
        </select>
      </label>
      {feedback && <p className={error ? "form-feedback error" : "form-feedback"} role="status">{feedback}</p>}
      <button className="button-secondary" type="submit">Vincular pré-cadastro</button>
    </form>
  );
}
