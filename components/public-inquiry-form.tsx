"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { buildWhatsAppUrl, HomepageInquiryPayload, submitHomepageInquiry } from "@/lib/public-inquiry";

type PublicInquiryFormProps = {
  variant: "compact" | "detailed";
};

type SubmissionSource = HomepageInquiryPayload["source"];

export function PublicInquiryForm({ variant }: PublicInquiryFormProps) {
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDetailed = variant === "detailed";

  async function submitForm(form: HTMLFormElement, source: SubmissionSource) {

    if (!form.checkValidity()) {
      setHasError(true);
      setFeedback("Confira os campos obrigatórios antes de continuar.");
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const subject = String(formData.get("subject") ?? "").trim();
    const payload: HomepageInquiryPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      source,
      ...(subject ? { subject } : {}),
    };

    setIsSubmitting(true);
    setHasError(false);
    setFeedback("");

    try {
      await submitHomepageInquiry(payload);
      form.reset();
      setFeedback(source === "WHATSAPP" ? "Mensagem registrada. Vamos continuar no WhatsApp." : "Mensagem enviada com sucesso. Em breve entraremos em contato.");

      if (source === "WHATSAPP") {
        window.open(buildWhatsAppUrl(payload), "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setHasError(true);
      setFeedback(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  const subjectId = `${idPrefix}-subject`;
  const messageId = `${idPrefix}-message`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitForm(event.currentTarget, isDetailed ? "CONTATO_INTERNO" : "FLUTUANTE");
  }

  function handleWhatsAppClick() {
    if (formRef.current) void submitForm(formRef.current, "WHATSAPP");
  }

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field"><label htmlFor={nameId}>Nome</label><input id={nameId} name="name" type="text" autoComplete="name" placeholder="Como você gostaria de ser chamado?" required /></div>
      <div className="form-field"><label htmlFor={emailId}>E-mail</label><input id={emailId} name="email" type="email" autoComplete="email" placeholder="voce@email.com" required /></div>
      {isDetailed && <div className="form-field"><label htmlFor={subjectId}>Assunto</label><input id={subjectId} name="subject" type="text" placeholder="Sobre o que você gostaria de conversar?" /></div>}
      <div className="form-field"><label htmlFor={messageId}>Mensagem</label><textarea id={messageId} name="message" placeholder="Escreva algumas palavras, no seu tempo." required /></div>
      <p className="form-feedback" data-error={hasError} aria-live="polite">{feedback}</p>
      {isDetailed ? (
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="button-primary" disabled={isSubmitting}>Enviar mensagem<ArrowUpRight size={18} aria-hidden="true" /></button>
          <button type="button" className="button-secondary" disabled={isSubmitting} onClick={handleWhatsAppClick}>Continuar no WhatsApp</button>
        </div>
      ) : (
        <button type="submit" className="button-primary justify-self-start" disabled={isSubmitting}>Enviar mensagem<ArrowUpRight size={18} aria-hidden="true" /></button>
      )}
    </form>
  );
}
