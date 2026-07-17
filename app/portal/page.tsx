import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export default async function PortalPage() {
  const user = await requireUser();
  const [pending, confirmed, next] = await Promise.all([
    prisma.appointmentRequest.count({ where: { clientId: user.id, status: "PENDING" } }),
    prisma.appointment.count({ where: { clientId: user.id, status: "CONFIRMED" } }),
    prisma.appointment.findFirst({ where: { clientId: user.id, status: "CONFIRMED", startAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, include: { therapist: true } }),
  ]);

  return <div><div className="portal-heading"><div><p className="eyebrow">Painel</p><h1 className="display-font">Olá, {user.name.split(" ")[0]}.</h1><p>Um resumo do seu cuidado e dos próximos passos.</p></div><Link className="button-primary" href="/portal/agendar">Agendar consulta</Link></div><div className="dashboard-grid"><article className="data-card"><span>Solicitações abertas</span><strong>{pending}</strong><small>Aguardando retorno</small></article><article className="data-card"><span>Consultas confirmadas</span><strong>{confirmed}</strong><small>Em sua jornada</small></article><article className="data-card"><span>Próximo passo</span><strong>{next ? <CheckCircle2 size={28} /> : <Clock3 size={28} />}</strong><small>{next ? "Atendimento confirmado" : "Escolha um horário para começar"}</small></article></div><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Próximas consultas</p><h2 className="display-font">Sua agenda de cuidado</h2></div><Link href="/portal/consultas">Ver histórico</Link></div>{next ? <div className="next-appointment"><CalendarDays size={24} /><div><strong>{next.therapist.name}</strong><span>{next.startAt.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}</span></div></div> : <div className="empty-state"><CalendarDays size={34} /><h3>Nenhuma consulta confirmada</h3><p>Solicite um horário e acompanhe o retorno por aqui.</p><Link className="button-primary" href="/portal/agendar">Escolher horário</Link></div>}</section></div>;
}
