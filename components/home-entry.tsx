import Image from "next/image";

type HomeEntryProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    contactLabel: string;
    imageAlt: string;
    imagePriority: boolean;
    fullName: string;
    academicFormation: string;
  };
};

export function HomeEntry({ content }: HomeEntryProps) {
  return (
    <section id="inicio" className="section-shell home-entry" aria-labelledby="home-entry-title">
      <div className="home-entry-backdrop" aria-hidden="true" />
      <div className="home-entry-card">
        <div className="home-entry-media">
          <Image
            className="home-entry-background"
            src="/images/home-background.png"
            alt={content.imageAlt}
            fill
            priority={content.imagePriority}
            sizes="(max-width: 860px) 100vw, 1180px"
          />
        </div>
        <div className="home-entry-content">
          <div className="home-entry-copy">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1 id="home-entry-title" className="display-font home-entry-title">{content.title}</h1>
          </div>
          <div className="home-profile-caption">
            <strong>{content.fullName}</strong>
            <p>{content.academicFormation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
