import Link from "next/link";
import { Settings } from "lucide-react";

import { PasswordSettingsForm } from "@/components/password-settings-form";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth/guards";

export default async function AccountSettingsPage() {
  const user = await requireUser();
  const homePath = user.role === "CLIENT" ? "/portal" : "/admin";

  return (
    <div className="portal-page">
      <header className="portal-topbar">
        <Link className="portal-brand" href={homePath}>
          <span className="portal-mark">TN</span>
          <span><strong>Marilene Neves da Paz Lima</strong></span>
        </Link>
        <div className="portal-actions">
          <span>{user.name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="portal-main">
        <div className="portal-heading">
          <div>
            <p className="eyebrow">Segurança</p>
            <h1 className="display-font">Configurações</h1>
            <p>Atualize a senha de acesso da sua própria conta.</p>
          </div>
          <Link className="button-secondary" href={homePath}>Voltar</Link>
        </div>
        <section className="portal-panel form-panel account-settings-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Acesso</p><h2 className="display-font"><Settings size={25} aria-hidden="true" /> Alterar senha</h2></div>
          </div>
          <div className="account-email"><span>Email da conta</span><strong>{user.email}</strong></div>
          <PasswordSettingsForm />
        </section>
      </main>
    </div>
  );
}
