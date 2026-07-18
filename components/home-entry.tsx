import Image from "next/image";
import Link from "next/link";

type HomeEntryProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    contactLabel: string;
    portalLabel: string;
    imageAlt: string;
    imagePriority: boolean;
    complementTitle: string;
    complementLabel: string;
  };
};

export function HomeEntry({ content }: HomeEntryProps) {
  return (
    <section className="section-shell home-entry" aria-labelledby="home-entry-title">
      <div className="home-entry-card">
        <div className="home-entry-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="home-entry-title" className="display-font home-entry-title">{content.title}</h1>
          <p className="home-entry-description">{content.description}</p>
          <div className="home-entry-actions">
            <Link className="button-primary" href="/contato">{content.contactLabel}</Link>
            <Link className="button-secondary" href="/entrar">{content.portalLabel}</Link>
          </div>
        </div>
        <div className="home-profile">
          <Image
            className="home-profile-image"
            src="/images/profile.jpeg"
            alt={content.imageAlt}
            fill
            priority={content.imagePriority}
            sizes="(max-width: 720px) calc(100vw - 3rem), (max-width: 1100px) 43vw, 610px"
          />
        </div>
      </div>
      <aside className="home-complement" aria-label="Contato">
        <h2 className="display-font">{content.complementTitle}</h2>
        <Link className="button-secondary" href="/contato">{content.complementLabel}</Link>
      </aside>
    </section>
  );
}
