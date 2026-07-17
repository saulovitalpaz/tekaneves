import Link from "next/link";
import { CalendarDays, ClipboardList, LayoutDashboard, MessageCircle } from "lucide-react";
import { SafeUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";

export function PortalShell({ user, children }: { user: SafeUser; children: React.ReactNode }) {
  return <div className="portal-page"><header className="portal-topbar"><Link className="portal-brand" href="/portal"><span className="portal-mark">TN</span><span><strong>Teka Neves</strong><small>Área do paciente</small></span></Link><nav className="portal-nav" aria-label="Área do paciente"><Link href="/portal"><LayoutDashboard size={16} />Resumo</Link><Link href="/portal/agendar"><CalendarDays size={16} />Agendar</Link><Link href="/portal/consultas"><ClipboardList size={16} />Consultas</Link><Link href="/portal/contato"><MessageCircle size={16} />Contato</Link></nav><div className="portal-user"><span>{user.name}</span><LogoutButton /></div></header><main className="portal-main">{children}</main></div>;
}
