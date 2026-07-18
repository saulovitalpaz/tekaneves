import { HomepageQuoteCardData } from "@/lib/homepage-quote";

export function HomepageQuoteCard({ quote }: { quote: HomepageQuoteCardData }) {
  return (
    <section className="section-shell homepage-quote-section" aria-labelledby="homepage-quote-title">
      <article className="homepage-quote-card">
        <p className="eyebrow" id="homepage-quote-title">Para lembrar</p>
        <blockquote>
          <p>{quote.text}</p>
          <footer>{quote.author}</footer>
        </blockquote>
      </article>
    </section>
  );
}
