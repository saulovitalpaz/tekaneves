type Message = { id: string; subject: string; body: string; createdAt: Date; sender?: { name: string }; recipient?: { name: string } };

export function MessageList({ messages }: { messages: Message[] }) {
  if (!messages.length) return <div className="empty-state"><h3>Nenhuma mensagem ainda</h3><p>Quando houver um retorno relacionado ao atendimento, ele aparecerá aqui.</p></div>;
  return <div className="message-list">{messages.map((message) => <article className="message-card" key={message.id}><div><strong>{message.subject}</strong><small>{message.sender?.name ? `De ${message.sender.name}` : message.recipient?.name ? `Para ${message.recipient.name}` : "Mensagem"} • {message.createdAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</small></div><p>{message.body}</p></article>)}</div>;
}
