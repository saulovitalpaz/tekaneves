import { AppointmentStatus } from "@prisma/client";

import { AppointmentSummaryForm } from "@/components/appointment-summary-form";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

function durationMinutes(startAt: Date, endAt: Date) {
  return Math.round((endAt.getTime() - startAt.getTime()) / 60000);
}

export default async function AdminSummariesPage() {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const appointmentWhere = user.role === "ADMIN" ? {} : { therapistId: user.id };
  const [appointments, completed] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...appointmentWhere, status: AppointmentStatus.CONFIRMED },
      include: { client: true, therapist: true, summary: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { ...appointmentWhere, status: AppointmentStatus.COMPLETED },
      include: { client: true, therapist: true, summary: true },
      orderBy: { startAt: "desc" },
    }),
  ]);

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Resumos</p>
          <h1 className="display-font">Resumos e histórico.</h1>
          <p>Registre resumos privados e consulte os atendimentos concluídos vinculados aos pacientes.</p>
        </div>
      </div>

      <section className="portal-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atendimentos</p>
            <h2 className="display-font">Consultas abertas</h2>
          </div>
        </div>
        {appointments.length ? (
          <div className="summary-card-list">
            {appointments.map((appointment) => (
              <article className="summary-card" key={appointment.id}>
                <div className="summary-card-heading">
                  <div>
                    <strong>{appointment.client.name}</strong>
                    <span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {durationMinutes(appointment.startAt, appointment.endAt)} min</span>
                  </div>
                </div>
                <AppointmentSummaryForm 
                  appointmentId={appointment.id} 
                  initialBody={appointment.summary?.body ?? ""} 
                  initialClientNote={appointment.summary?.clientNote ?? ""}
                  status="CONFIRMED" 
                />
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><h3>Nenhuma consulta confirmada</h3><p>Quando houver atendimentos confirmados, os cards para resumo aparecerão aqui.</p></div>}
      </section>

      <section className="portal-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2 className="display-font">Atendimentos concluídos</h2>
          </div>
        </div>
        {completed.length ? (
          <div className="summary-card-list">
            {completed.map((appointment) => (
              <details className="summary-card" key={appointment.id} style={{ padding: "0" }}>
                <summary className="summary-card-heading" style={{ cursor: "pointer", padding: "1.25rem", margin: 0 }}>
                  <div>
                    <strong>{appointment.client.name}</strong>
                    <span>{appointment.therapist.name} · {appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {durationMinutes(appointment.startAt, appointment.endAt)} min</span>
                  </div>
                </summary>
                <div style={{ padding: "0 1.25rem 1.25rem" }}>
                  <AppointmentSummaryForm 
                    appointmentId={appointment.id} 
                    initialBody={appointment.summary?.body ?? ""} 
                    initialClientNote={appointment.summary?.clientNote ?? ""}
                    status="COMPLETED" 
                  />
                </div>
              </details>
            ))}
          </div>
        ) : <div className="empty-state"><h3>Nenhum atendimento concluído</h3><p>O histórico aparecerá aqui após concluir uma consulta.</p></div>}
      </section>
    </div>
  );
}
