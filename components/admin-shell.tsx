import Link from "next/link";
import { CalendarDays, ClipboardList, LayoutDashboard, MessageCircle, Settings, Users } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { SafeUser } from "@/lib/auth/session";

export function AdminShell({ user, children }: { user: SafeUser; children: React.ReactNode }) {
  return (
    <div className="portal-page">
      <header className="portal-topbar">
        <Link className="portal-brand" href="/admin">
          <span className="portal-mark">TN</span>
          <span><strong>Marilene Neves da Paz Lima</strong></span>
        </Link>
        <nav className="portal-nav" aria-label="Administração">
          <Link href="/admin"><LayoutDashboard size={16} />Dashboard</Link>
          <Link href="/admin/agenda"><CalendarDays size={16} />Agenda</Link>
          <Link href="/admin/resumos"><ClipboardList size={16} />Consulta</Link>
          <Link href="/admin/clientes"><Users size={16} />Clientes</Link>
          <Link href="/admin/mensagens"><MessageCircle size={16} />Mensagens</Link>
          <Link href="/configuracoes"><Settings size={16} />Configurações</Link>
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
