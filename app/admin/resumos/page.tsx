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
  const appointments = await prisma.appointment.findMany({
    where: { ...appointmentWhere, status: AppointmentStatus.CONFIRMED },
    include: { client: true, therapist: true, summary: true },
    orderBy: { startAt: "asc" },
  });

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Resumos</p>
          <h1 className="display-font">Consultas confirmadas.</h1>
          <p>Selecione um atendimento confirmado para registrar o resumo privado já vinculado ao paciente.</p>
        </div>
      </div>

      <section className="portal-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atendimentos</p>
            <h2 className="display-font">Resumo vinculado ao paciente</h2>
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
                  <small>Paciente vinculado</small>
                </div>
                <AppointmentSummaryForm appointmentId={appointment.id} initialBody={appointment.summary?.body ?? ""} status="CONFIRMED" />
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><h3>Nenhuma consulta confirmada</h3><p>Quando houver atendimentos confirmados, os cards para resumo aparecerão aqui.</p></div>}
      </section>
    </div>
  );
}
