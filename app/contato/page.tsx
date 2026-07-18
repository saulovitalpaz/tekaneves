import { ContactSection } from "@/components/contact-section";
import { PublicSiteFrame } from "@/components/public-site-frame";

export default function ContactPage() {
  return (
    <PublicSiteFrame>
      <main>
        <ContactSection content={{
          eyebrow: "Contato",
          title: "Vamos conversar?",
          description: "Use este espaço para contar, com calma, como podemos ajudar. Seus dados serão usados somente para retornar seu contato.",
          nameLabel: "Nome",
          emailLabel: "E-mail",
          messageLabel: "Mensagem",
          submitLabel: "Enviar mensagem",
        }} />
      </main>
    </PublicSiteFrame>
  );
}
