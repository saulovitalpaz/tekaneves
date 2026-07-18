import { HomeEntry } from "@/components/home-entry";
import { HomepageQuoteCard } from "@/components/homepage-quote-card";
import { PublicSiteFrame } from "@/components/public-site-frame";
import { siteContent } from "@/lib/content";
import { getHomepageQuoteCard } from "@/lib/homepage-quote";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const quote = await getHomepageQuoteCard();

  return (
    <PublicSiteFrame>
      <main>
        <HomeEntry content={siteContent.home} />
        {quote && <HomepageQuoteCard quote={quote} />}
      </main>
    </PublicSiteFrame>
  );
}
