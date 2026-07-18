import { HomeEntry } from "@/components/home-entry";
import { PublicSiteFrame } from "@/components/public-site-frame";
import { siteContent } from "@/lib/content";

export default function HomePage() {
  return (
    <PublicSiteFrame>
      <main>
        <HomeEntry content={siteContent.home} />
      </main>
    </PublicSiteFrame>
  );
}
