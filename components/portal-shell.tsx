import Link from "next/link";
import { CalendarDays, ClipboardList, LayoutDashboard, MessageCircle, Settings } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { SafeUser } from "@/lib/auth/session";

export function PortalShell({ user, children }: { user: SafeUser; children: React.ReactNode }) {
  return (
    <div className="portal-page">
      <header className="portal-topbar">
        <Link className="portal-brand" href="/portal">
          <span className="portal-mark">TN</span>
          <span><strong>Marilene Neves da Paz Lima</strong></span>
        </Link>
        <nav className="portal-nav" aria-label="Área do paciente">
          <Link href="/portal"><LayoutDashboard size={16} />Resumo</Link>
          <Link href="/portal/agendar"><CalendarDays size={16} />Agendar</Link>
          <Link href="/portal/consultas"><ClipboardList size={16} />Consultas</Link>
          <Link href="/portal/contato"><MessageCircle size={16} />Contato</Link>
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
