"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type ContactFormProps = {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submitLabel: string;
};

export function ContactForm({ nameLabel, emailLabel, messageLabel, submitLabel }: ContactFormProps) {
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setHasError(true);
      setFeedback("Confira os campos obrigatórios antes de continuar.");
      form.reportValidity();
      return;
    }
    setHasError(false);
    setFeedback("Prévia enviada com sucesso. Esta mensagem ainda não foi enviada.");
    form.reset();
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field"><label htmlFor="contact-name">{nameLabel}</label><input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Como você gostaria de ser chamado?" required /></div>
      <div className="form-field"><label htmlFor="contact-email">{emailLabel}</label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required /></div>
      <div className="form-field"><label htmlFor="contact-message">{messageLabel}</label><textarea id="contact-message" name="message" placeholder="Escreva algumas palavras, no seu tempo." required /></div>
      <p className="form-feedback" data-error={hasError} aria-live="polite">{feedback}</p>
      <button type="submit" className="button-primary justify-self-start">{submitLabel}<ArrowUpRight size={18} aria-hidden="true" /></button>
    </form>
  );
}
