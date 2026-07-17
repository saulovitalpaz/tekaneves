import { MessageCircle } from "lucide-react";

export function FloatingContactButton() {
  return (
    <a className="floating-contact" href="#contato" aria-label="Falar comigo">
      <MessageCircle size={19} aria-hidden="true" />
      <span>Falar comigo</span>
    </a>
  );
}
