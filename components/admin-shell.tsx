import Link from "next/link";
import { CalendarDays, LayoutDashboard, MessageCircle, Users } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { SafeUser } from "@/lib/auth/session";

export function AdminShell({ user, children }: { user: SafeUser; children: React.ReactNode }) {
  return (
    <div className="portal-page">
      <header className="portal-topbar">
        <Link className="portal-brand" href="/admin">
          <span className="portal-mark">TN</span>
          <span><strong>Teka Neves</strong><small>Gestão de atendimentos</small></span>
        </Link>
        <nav className="portal-nav" aria-label="Administração">
          <Link href="/admin"><LayoutDashboard size={16} />Resumo</Link>
          <Link href="/admin/agenda"><CalendarDays size={16} />Agenda</Link>
          <Link href="/admin/clientes"><Users size={16} />Clientes</Link>
          <Link href="/admin/mensagens"><MessageCircle size={16} />Mensagens</Link>
        </nav>
        <div className="portal-actions">
          <span>{user.name}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
