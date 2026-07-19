import { HomepageInquiryReadButton } from "@/components/homepage-inquiry-read-button";

type HomepageInquirySource = "FLUTUANTE" | "CONTATO_INTERNO" | "WHATSAPP";

type HomepageInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  source: HomepageInquirySource;
  createdAt: Date;
  readAt: Date | null;
};

export function homepageInquirySourceLabel(source: HomepageInquirySource) {
  return {
    FLUTUANTE: "Janela flutuante",
    CONTATO_INTERNO: "Contato pelo site",
    WHATSAPP: "WhatsApp",
  }[source];
}

export function HomepageInquiryList({ inquiries }: { inquiries: HomepageInquiry[] }) {
  if (!inquiries.length) {
    return <div className="empty-state"><h3>Nenhum contato pela homepage</h3><p>Quando alguém entrar em contato pelo site, a mensagem aparecerá aqui.</p></div>;
  }

  return <div className="homepage-inquiry-list">{inquiries.map((inquiry) => <article className={`homepage-inquiry-card ${inquiry.readAt ? "is-read" : "is-unread"}`} key={inquiry.id}><div className="homepage-inquiry-heading"><span className="homepage-inquiry-source">{homepageInquirySourceLabel(inquiry.source)}</span><small>{inquiry.createdAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</small></div><strong>{inquiry.name}</strong><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>{inquiry.subject && <h3>{inquiry.subject}</h3>}<p>{inquiry.message}</p>{inquiry.readAt ? <small className="homepage-inquiry-read-state">Lido</small> : <HomepageInquiryReadButton inquiryId={inquiry.id} />}</article>)}</div>;
}
