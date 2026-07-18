import { PublicInquiryForm } from "@/components/public-inquiry-form";

export default function ContactPage() {
  return (
    <main className="section-shell py-16">
      <section className="soft-panel contact-panel" aria-labelledby="contact-page-title">
        <p className="eyebrow">Contato</p>
        <h1 id="contact-page-title" className="display-font section-heading">Vamos conversar?</h1>
        <p className="section-intro">Use este espaço para contar, com calma, como podemos ajudar. Seus dados serão usados somente para retornar seu contato.</p>
        <p className="section-intro">Em situações urgentes, procure imediatamente o serviço de emergência da sua região.</p>
        <PublicInquiryForm variant="detailed" />
      </section>
    </main>
  );
}
