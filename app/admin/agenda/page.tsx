import { AppointmentStatus, AppointmentRequestStatus } from "@prisma/client";

import { AppointmentDecisionForm } from "@/components/appointment-decision-form";
import { AvailabilityForm } from "@/components/availability-form";
import { AvailabilityList } from "@/components/availability-list";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

function durationMinutes(startAt: Date, endAt: Date) {
  return Math.round((endAt.getTime() - startAt.getTime()) / 60000);
}

export default async function AdminAgendaPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const pendingStatuses = [AppointmentRequestStatus.PENDING, AppointmentRequestStatus.PROPOSED];
  const requestWhere = user.role === "ADMIN" ? { status: { in: pendingStatuses } } : { therapistId: user.id, status: { in: pendingStatuses } };
  const appointmentWhere = user.role === "ADMIN" ? {} : { therapistId: user.id };
  const [pending, confirmed, completed, profiles] = await Promise.all([
    prisma.appointmentRequest.findMany({ where: requestWhere, include: { client: true, therapist: true }, orderBy: { desiredStart: "asc" } }),
    prisma.appointment.findMany({ where: { ...appointmentWhere, status: AppointmentStatus.CONFIRMED }, include: { client: true, therapist: true }, orderBy: { startAt: "asc" } }),
    prisma.appointment.findMany({ where: { ...appointmentWhere, status: AppointmentStatus.COMPLETED }, include: { client: true, therapist: true }, orderBy: { startAt: "desc" } }),
    prisma.therapistProfile.findMany({ where: user.role === "ADMIN" ? undefined : { userId: user.id }, include: { user: true, availabilities: { orderBy: { weekday: "asc" } } } }),
  ]);

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1 className="display-font">Horários com cuidado.</h1>
          <p>Configure disponibilidade, acompanhe próximos atendimentos, solicitações e histórico.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="data-card"><span>Solicitações pendentes</span><strong>{pending.length}</strong></article>
        <article className="data-card"><span>Consultas confirmadas</span><strong>{confirmed.length}</strong></article>
        <article className="data-card"><span>Consultas concluídas</span><strong>{completed.length}</strong></article>
      </div>

      <section className="portal-panel">
        <div className="panel-heading"><div><p className="eyebrow">Agenda</p><h2 className="display-font">Próximos atendimentos</h2></div></div>
        {confirmed.length ? confirmed.map((appointment) => (
          <article className="appointment-row" key={appointment.id}>
            <div>
              <strong>{appointment.client.name}</strong>
              <span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {durationMinutes(appointment.startAt, appointment.endAt)} min</span>
            </div>
          </article>
        )) : <div className="empty-state"><h3>Nenhum atendimento confirmado</h3><p>Consultas confirmadas aparecerão aqui.</p></div>}
      </section>

      <section className="portal-panel">
        <div className="panel-heading"><div><p className="eyebrow">Solicitações</p><h2 className="display-font">Próximos pedidos</h2></div></div>
        {pending.length ? <div className="admin-request-list">{pending.map((request) => (
          <article className="admin-request" key={request.id}>
            <div>
              <strong>{request.client.name}</strong>
              <span>{request.therapist.name} · {request.desiredStart.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span>
              <p>{request.message}</p>
            </div>
            <AppointmentDecisionForm requestId={request.id} />
          </article>
        ))}</div> : <div className="empty-state"><h3>Nenhuma solicitação pendente</h3><p>Quando um cliente pedir um horário, ele aparecerá aqui.</p></div>}
      </section>

      <section className="portal-panel">
        <div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2 className="display-font">Atendimentos concluídos</h2></div></div>
        {completed.length ? completed.map((appointment) => (
          <article className="appointment-row" key={appointment.id}>
            <div>
              <strong>{appointment.client.name}</strong>
              <span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {durationMinutes(appointment.startAt, appointment.endAt)} min</span>
            </div>
          </article>
        )) : <div className="empty-state"><h3>Nenhum atendimento concluído</h3><p>O histórico aparecerá aqui após concluir uma consulta.</p></div>}
      </section>

      <section className="portal-panel">
        <div className="panel-heading"><div><p className="eyebrow">Disponibilidades</p><h2 className="display-font">Janelas de atendimento</h2></div></div>
        {profiles.map((profile) => (
          <div className="availability-block" key={profile.id}>
            <strong>{profile.user.name}</strong>
            <AvailabilityList therapistId={profile.userId} items={profile.availabilities} />
            <AvailabilityForm therapistId={profile.userId} />
          </div>
        ))}
      </section>
    </div>
  );
}
