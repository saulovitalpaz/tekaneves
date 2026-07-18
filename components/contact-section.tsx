import { PublicInquiryForm } from "./public-inquiry-form";

type ContactSectionProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submitLabel: string;
  };
};

export function ContactSection({ content }: ContactSectionProps) {
  return (
    <section id="contato" className="contact-section" aria-labelledby="contact-title">
      <div className="section-shell soft-panel contact-panel">
        <div><p className="eyebrow">{content.eyebrow}</p><h2 id="contact-title" className="display-font section-heading">{content.title}</h2><p className="section-intro">{content.description}</p></div>
        <PublicInquiryForm variant="detailed" />
      </div>
    </section>
  );
}
