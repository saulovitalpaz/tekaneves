import { CalendarDays } from "lucide-react";

import { AppointmentProposalActions } from "@/components/appointment-proposal-actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

const statusLabels: Record<string, string> = { PENDING: "Aguardando retorno", CONFIRMED: "Confirmada", DECLINED: "Indisponível", PROPOSED: "Novo horário sugerido", CANCELLED: "Cancelada", COMPLETED: "Realizada" };

export default async function ConsultationsPage() {
  const user = await requireUser();
  const requests = await prisma.appointmentRequest.findMany({
    where: { clientId: user.id },
    select: {
      id: true,
      therapistId: true,
      desiredStart: true,
      proposedStart: true,
      status: true,
      therapist: { select: { name: true } },
      appointment: { select: { status: true, summary: { select: { clientNote: true } } } },
    },
    orderBy: { desiredStart: "desc" },
  });

  return (
    <div>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">Sua jornada</p>
          <h1 className="display-font">Consultas</h1>
          <p>Cada solicitação e atendimento registrado com cuidado.</p>
        </div>
      </div>
      <section className="portal-panel">
        {requests.length ? (
          <div className="portal-list">
            {requests.map((request) => {
              const visibleStatus = request.appointment?.status ?? request.status;
              const note = request.appointment?.summary?.clientNote;
              
              return (
                <div key={request.id} style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid var(--line)" }}>
                  <article className="list-row" style={{ borderBottom: 0 }}>
                    <CalendarDays size={22} />
                    <div>
                      <strong>{request.therapist.name}</strong>
                      <span>{(request.proposedStart ?? request.desiredStart).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <span className={`status-chip ${visibleStatus.toLowerCase()}`}>{statusLabels[visibleStatus]}</span>
                    {request.status === "PROPOSED" && request.proposedStart && (
                      <AppointmentProposalActions requestId={request.id} therapistId={request.therapistId} proposedStart={request.proposedStart} />
                    )}
                  </article>
                  {note && (
                    <div style={{ margin: "0 1rem 1rem", padding: "1rem", backgroundColor: "var(--paper-deep)", borderRadius: "var(--card-radius)", fontSize: "0.9rem" }}>
                      <strong>Nota da terapeuta:</strong>
                      <p style={{ marginTop: "0.5rem", marginBottom: 0, whiteSpace: "pre-wrap" }}>{note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state"><CalendarDays size={34} /><h3>Nenhuma solicitação registrada</h3><p>Quando você solicitar um atendimento, ele aparecerá aqui.</p></div>}
      </section>
    </div>
  );
}
