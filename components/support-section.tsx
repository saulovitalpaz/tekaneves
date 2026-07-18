type SupportSectionProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
  };
};

export function SupportSection({ content }: SupportSectionProps) {
  return (
    <section id="acompanhamento" className="support-section" aria-labelledby="support-title">
      <div className="section-shell support-layout">
        <div className="support-heading">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="support-title" className="display-font section-heading">{content.title}</h2>
          <p className="section-intro">{content.description}</p>
        </div>
      </div>
    </section>
  );
}
