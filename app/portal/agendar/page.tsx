import { AppointmentRequestForm } from "@/components/appointment-request-form";
import { requireUser } from "@/lib/auth/guards";
import { getPrimaryTherapist } from "@/lib/primary-therapist";

export default async function SchedulePage() {
  await requireUser();
  const therapist = await getPrimaryTherapist();
  return <div><div className="portal-heading"><div><p className="eyebrow">Nova solicitação</p><h1 className="display-font">Agendar atendimento</h1><p>Escolha uma preferência de horário e conte brevemente o que gostaria de cuidar.</p></div></div><section className="portal-panel form-panel">{therapist ? <AppointmentRequestForm therapists={[{ id: therapist.id, name: therapist.name, specialty: therapist.therapistProfile?.specialty ?? null }]} /> : <p className="form-feedback error">Nenhuma terapeuta principal está configurada no momento.</p>}</section></div>;
}
