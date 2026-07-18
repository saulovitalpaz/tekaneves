import Image from "next/image";

type AboutSectionProps = {
  content: {
    eyebrow: string;
    title: string;
    paragraphs: readonly string[];
    ctaLabel: string;
    ctaHref: string;
    imageAlt: string;
    imagePriority: boolean;
  };
};

export function AboutSection({ content }: AboutSectionProps) {
  return (
    <section id="sobre" className="about-section" aria-labelledby="about-title">
      <div className="section-shell about-layout">
        <div className="about-photo-wrap"><div className="about-photo"><Image src="/images/profile.jpeg" alt={content.imageAlt} fill priority={content.imagePriority} sizes="(max-width: 860px) 80vw, 430px" /></div></div>
        <div className="about-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="about-title" className="display-font section-heading">{content.title}</h1>
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <a className="button-primary" href={content.ctaHref}>{content.ctaLabel}<span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
