import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

const statusLabels: Record<string, string> = { PENDING: "Aguardando retorno", CONFIRMED: "Confirmada", DECLINED: "Indisponível", PROPOSED: "Novo horário sugerido", CANCELLED: "Cancelada", COMPLETED: "Realizada" };

export default async function ConsultationsPage() {
  const user = await requireUser();
  const requests = await prisma.appointmentRequest.findMany({ where: { clientId: user.id }, include: { therapist: true, appointment: true }, orderBy: { desiredStart: "desc" } });
  return <div><div className="portal-heading"><div><p className="eyebrow">Sua jornada</p><h1 className="display-font">Consultas</h1><p>Cada solicitação e atendimento registrado com cuidado.</p></div></div><section className="portal-panel">{requests.length ? <div className="portal-list">{requests.map((request) => <article className="list-row" key={request.id}><CalendarDays size={22} /><div><strong>{request.therapist.name}</strong><span>{request.desiredStart.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span></div><span className={`status-chip ${request.status.toLowerCase()}`}>{statusLabels[request.status]}</span></article>)}</div> : <div className="empty-state"><CalendarDays size={34} /><h3>Nenhuma solicitação registrada</h3><p>Quando você solicitar um atendimento, ele aparecerá aqui.</p></div>}</section></div>;
}
