import { AvailabilityForm } from "@/components/availability-form";
import { AppointmentDecisionForm } from "@/components/appointment-decision-form";
import { AppointmentRequestStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminAgendaPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const pendingStatuses: AppointmentRequestStatus[] = [AppointmentRequestStatus.PENDING, AppointmentRequestStatus.PROPOSED];
  const requestWhere = user.role === "ADMIN" ? { status: { in: pendingStatuses } } : { therapistId: user.id, status: { in: pendingStatuses } };
  const [requests, profiles] = await Promise.all([
    prisma.appointmentRequest.findMany({ where: requestWhere, include: { client: true, therapist: true }, orderBy: { desiredStart: "asc" } }),
    prisma.therapistProfile.findMany({ where: user.role === "ADMIN" ? undefined : { userId: user.id }, include: { user: true, availabilities: { where: { isActive: true }, orderBy: { weekday: "asc" } } } }),
  ]);
  return <div><div className="portal-heading"><div><p className="eyebrow">Agenda</p><h1 className="display-font">Horários com cuidado.</h1><p>Configure disponibilidade e responda às solicitações dos clientes.</p></div></div><section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Disponibilidades</p><h2 className="display-font">Janelas de atendimento</h2></div></div>{profiles.map((profile) => <div className="availability-block" key={profile.id}><strong>{profile.user.name}</strong><div className="availability-list">{profile.availabilities.map((item) => <span key={item.id}>{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][item.weekday]} • {Math.floor(item.startMinutes / 60).toString().padStart(2, "0")}:{(item.startMinutes % 60).toString().padStart(2, "0")} às {Math.floor(item.endMinutes / 60).toString().padStart(2, "0")}:{(item.endMinutes % 60).toString().padStart(2, "0")}</span>)}</div><AvailabilityForm therapistId={profile.userId} /></div>)}</section><section className="portal-panel" style={{ marginTop: "1.5rem" }}><div className="panel-heading"><div><p className="eyebrow">Solicitações</p><h2 className="display-font">Próximos pedidos</h2></div></div>{requests.length ? <div className="admin-request-list">{requests.map((request) => <article className="admin-request" key={request.id}><div><strong>{request.client.name}</strong><span>{request.therapist.name} • {request.desiredStart.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span><p>{request.message}</p></div><AppointmentDecisionForm requestId={request.id} /></article>)}</div> : <div className="empty-state"><h3>Nenhuma solicitação pendente</h3><p>Quando um cliente pedir um horário, ele aparecerá aqui.</p></div>}</section></div>;
}
