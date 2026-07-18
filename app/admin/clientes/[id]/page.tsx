import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  const { id } = await params;
  const client = await prisma.user.findFirst({
    where: user.role === "ADMIN" ? { id, role: "CLIENT" } : { id, role: "CLIENT", clientAppointments: { some: { therapistId: user.id } } },
    select: { id: true, name: true, email: true },
  });
  if (!client) notFound();

  const appointmentScope = user.role === "ADMIN" ? { clientId: client.id } : { clientId: client.id, therapistId: user.id };
  const [nextAppointment, appointments] = await Promise.all([
    prisma.appointment.findFirst({
      where: { ...appointmentScope, status: AppointmentStatus.CONFIRMED, startAt: { gte: new Date() } },
      include: { therapist: { select: { name: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { ...appointmentScope, status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] } },
      include: { therapist: { select: { name: true } }, summary: { include: { author: { select: { name: true } } } } },
      orderBy: { startAt: "desc" },
    }),
  ]);

  return (
    <div>
      <Link className="text-link" href="/admin/clientes">Voltar para clientes</Link>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Cliente</p>
          <h1 className="display-font">{client.name}</h1>
          <p>{client.email}</p>
        </div>
      </div>

      <section className="portal-panel next-appointment-card">
        <p className="eyebrow">Lembrete</p>
        <h2 className="display-font">Próxima consulta</h2>
        {nextAppointment ? (
          <p>{nextAppointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · {nextAppointment.therapist.name}</p>
        ) : <p>Nenhuma consulta confirmada futura.</p>}
      </section>

      <section className="portal-panel">
        <p className="eyebrow">Histórico</p>
        <h2 className="display-font">Atendimentos</h2>
        {appointments.length ? appointments.map((appointment) => (
          <article className="appointment-row" key={appointment.id}>
            <div>
              <strong>{appointment.startAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</strong>
              <span>{appointment.therapist.name} · {appointment.status}</span>
            </div>
            {appointment.summary && (
              <div className="client-history-note">
                <strong>Resumo privado</strong>
                <p>{appointment.summary.body}</p>
                <small>Atualizado em {appointment.summary.updatedAt.toLocaleDateString("pt-BR")} por {appointment.summary.author.name}</small>
              </div>
            )}
          </article>
        )) : <div className="empty-state"><h3>Nenhum atendimento registrado</h3><p>Consultas deste cliente aparecerão aqui.</p></div>}
      </section>
    </div>
  );
}
