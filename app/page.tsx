import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { FloatingContactButton } from "@/components/floating-contact-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportSection } from "@/components/support-section";
import { siteContent } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <SiteHeader brand={siteContent.brand} navigation={siteContent.navigation} />
      <main>
        <AboutSection content={siteContent.about} />
        <SupportSection content={siteContent.support} />
        <section id="para-quem" className="audience-section" aria-labelledby="audience-title">
          <div className="section-shell audience-layout"><p className="eyebrow">{siteContent.audience.eyebrow}</p><div><h2 id="audience-title" className="display-font audience-title">{siteContent.audience.title}</h2><p className="audience-copy">{siteContent.audience.description}</p></div></div>
        </section>
        <ContactSection content={siteContent.contact} />
      </main>
      <SiteFooter brand={siteContent.brand.name} copy={siteContent.footer} />
      <FloatingContactButton />
    </>
  );
}
