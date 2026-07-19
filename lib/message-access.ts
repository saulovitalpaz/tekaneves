type MessageParticipant = {
  id: string;
  role: "ADMIN" | "THERAPIST" | "CLIENT";
};

type MessageContext = {
  clientId: string;
  therapistId: string;
};

export function canSendContextMessage(sender: MessageParticipant, recipient: MessageParticipant, context: MessageContext) {
  if (sender.id === recipient.id) return false;

  const belongsToContext = (participant: MessageParticipant) => (
    participant.role === "ADMIN" ||
    participant.id === context.clientId ||
    participant.id === context.therapistId
  );

  return belongsToContext(sender) && belongsToContext(recipient);
}
