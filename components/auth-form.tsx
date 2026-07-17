"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/v1/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(result.error?.message ?? "Não foi possível concluir.");
      return;
    }
    const role = result.data.role;
    router.push(role === "ADMIN" || role === "THERAPIST" ? "/admin" : "/portal");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "register" && <label>Nome<input name="name" required minLength={2} autoComplete="name" /></label>}
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Senha<input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button-primary" type="submit" disabled={pending}>{pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}</button>
    </form>
  );
}
