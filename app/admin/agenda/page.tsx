import { AppointmentStatus, AppointmentRequestStatus } from "@prisma/client";

import { AdminAppointmentForm } from "@/components/admin-appointment-form";
import { AppointmentDecisionForm } from "@/components/appointment-decision-form";
import { AvailabilityForm } from "@/components/availability-form";
import { AvailabilityList } from "@/components/availability-list";
import { PreRegistrationLinkForm } from "@/components/pre-registration-link-form";
import { PreRegistrationRejectButton } from "@/components/pre-registration-reject-button";
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
  const [pending, confirmed, profiles, clients, therapists, preRegistrations] = await Promise.all([
    prisma.appointmentRequest.findMany({ where: requestWhere, include: { client: true, therapist: true }, orderBy: { desiredStart: "asc" } }),
    prisma.appointment.findMany({ where: { ...appointmentWhere, status: AppointmentStatus.CONFIRMED }, include: { client: true, therapist: true }, orderBy: { startAt: "asc" } }),
    prisma.therapistProfile.findMany({ where: user.role === "ADMIN" ? undefined : { userId: user.id }, include: { user: true, availabilities: { orderBy: { weekday: "asc" } } } }),
    prisma.user.findMany({ where: { role: "CLIENT" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: user.role === "ADMIN" ? { role: { in: ["ADMIN", "THERAPIST"] } } : { id: user.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.preRegistration.findMany({
      where: { linkedUserId: null, rejectedAt: null, appointments: { some: user.role === "ADMIN" ? { linkedAppointmentId: null } : { therapistId: user.id, linkedAppointmentId: null } } },
      include: { appointments: { where: user.role === "ADMIN" ? { linkedAppointmentId: null } : { therapistId: user.id, linkedAppointmentId: null }, include: { therapist: { select: { name: true } } }, orderBy: { startAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Agenda</p>
          <h1 className="display-font">Horários com cuidado.</h1>
          <p>Acompanhe próximos atendimentos, solicitações e pré-cadastros pendentes.</p>
        </div>
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
        <div className="panel-heading"><div><p className="eyebrow">Gerenciamento</p><h2 className="display-font">Inserir na agenda</h2></div></div>
        <div style={{ marginBottom: "2rem" }}>
          <AdminAppointmentForm clients={clients} therapists={therapists} />
        </div>
        
        <details style={{ padding: "1.25rem", border: "1px solid var(--line)", borderRadius: "var(--card-radius)", background: "var(--paper-deep)" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--forest-deep)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Configurar janelas de atendimento (Disponibilidade)
          </summary>
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
            {profiles.map((profile) => (
              <div className="availability-block" key={profile.id}>
                <strong style={{ display: "block", marginBottom: "0.5rem" }}>{profile.user.name}</strong>
                <AvailabilityList therapistId={profile.userId} items={profile.availabilities} />
                <AvailabilityForm therapistId={profile.userId} />
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="portal-panel">
        <div className="panel-heading"><div><p className="eyebrow">Pré-cadastros</p><h2 className="display-font">Vincular ao autocadastro</h2></div></div>
        {preRegistrations.length ? <div className="pre-registration-list">{preRegistrations.map((registration) => (
          <article className="pre-registration-card" key={registration.id}>
            <div>
              <strong>{registration.name}</strong>
              <span>{[registration.email, registration.phone].filter(Boolean).join(" · ") || "Contato não informado"}</span>
              {registration.note && <p>{registration.note}</p>}
              {registration.appointments.map((appointment) => <small key={appointment.id}>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</small>)}
            </div>
            <div className="pre-registration-actions">
              <PreRegistrationLinkForm preRegistrationId={registration.id} clients={clients} />
              <PreRegistrationRejectButton preRegistrationId={registration.id} />
            </div>
          </article>
        ))}</div> : <div className="empty-state"><h3>Nenhum pré-cadastro pendente</h3><p>Horários criados sem cliente cadastrado aparecerão aqui para vínculo.</p></div>}
      </section>
    </div>
  );
}
