import Image from "next/image";
import { Sparkle } from "lucide-react";
import { DailyPhraseRotator } from "./daily-phrase-rotator";

type HeroSectionProps = {
  content: {
    eyebrow: string;
    title: string;
    description: string;
    imageAlt: string;
  };
  dailyPhrases: readonly { id: string; text: string }[];
};

export function HeroSection({ content, dailyPhrases }: HeroSectionProps) {
  return (
    <section id="inicio" className="section-shell hero-grid" aria-labelledby="hero-title">
      <div>
        <p className="eyebrow flex items-center gap-3"><Sparkle size={16} aria-hidden="true" />{content.eyebrow}</p>
        <h1 id="hero-title" className="display-font hero-title">{content.title}</h1>
        <p className="hero-copy">{content.description}</p>
      </div>
      <div className="hero-art">
        <div className="hero-photo-frame">
          <Image className="hero-photo" src="/images/profile.jpeg" alt={content.imageAlt} fill priority sizes="(max-width: 640px) 78vw, (max-width: 860px) 60vw, 470px" />
        </div>
        <DailyPhraseRotator phrases={dailyPhrases} />
      </div>
    </section>
  );
}
