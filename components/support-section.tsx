import { HeartHandshake, Leaf, MessageCircle, Waves } from "lucide-react";

const icons = [HeartHandshake, Waves, MessageCircle, Leaf];

type SupportSectionProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    areas: readonly { title: string; text: string }[];
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
        <div className="support-list">
          {content.areas.map((area, index) => {
            const Icon = icons[index % icons.length];
            return <article className="support-item" key={area.title}><Icon size={23} strokeWidth={1.5} className="text-[var(--forest)]" aria-hidden="true" /><h3>{area.title}</h3><p>{area.text}</p></article>;
          })}
        </div>
      </div>
    </section>
  );
}
