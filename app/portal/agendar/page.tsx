import { AppointmentRequestForm } from "@/components/appointment-request-form";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function SchedulePage() {
  await requireUser();
  const therapists = await prisma.user.findMany({ where: { role: "THERAPIST" }, select: { id: true, name: true, therapistProfile: { select: { specialty: true } } }, orderBy: { name: "asc" } });
  return <div><div className="portal-heading"><div><p className="eyebrow">Nova solicitação</p><h1 className="display-font">Agendar atendimento</h1><p>Escolha uma preferência de horário e conte brevemente o que gostaria de cuidar.</p></div></div><section className="portal-panel form-panel"><AppointmentRequestForm therapists={therapists.map((therapist) => ({ id: therapist.id, name: therapist.name, specialty: therapist.therapistProfile?.specialty ?? null }))} /></section></div>;
}
