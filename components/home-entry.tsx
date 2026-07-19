import Image from "next/image";
import Link from "next/link";

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
      <div className="home-entry-card">
        <div className="home-entry-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="home-entry-title" className="display-font home-entry-title">{content.title}</h1>
        </div>
        <div className="home-profile-wrapper">
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
          <div className="home-profile-caption">
            <strong>{content.fullName}</strong>
            <p>{content.academicFormation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
