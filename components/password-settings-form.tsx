"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";

export function PasswordSettingsForm() {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    setError(false);

    const response = await fetch("/api/v1/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())),
    });
    const result = await response.json().catch(() => null);
    setPending(false);

    if (!response.ok) {
      setError(true);
      setFeedback(result?.error?.message ?? "Não foi possível alterar sua senha.");
      return;
    }

    event.currentTarget.reset();
    setFeedback("Senha alterada com sucesso.");
  }

  return (
    <form className="portal-form" onSubmit={submit}>
      <label>Senha atual<input name="currentPassword" type="password" required autoComplete="current-password" /></label>
      <label>Nova senha<input name="newPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label>Confirmar nova senha<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>
      {feedback && <p className={`form-feedback${error ? " error" : ""}`} role="status">{feedback}</p>}
      <button className="button-primary" type="submit" disabled={pending}><KeyRound size={16} aria-hidden="true" />{pending ? "Salvando..." : "Alterar senha"}</button>
    </form>
  );
}
