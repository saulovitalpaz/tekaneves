"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return <button className="portal-logout" type="button" onClick={logout}>Sair</button>;
}
