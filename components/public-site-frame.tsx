import type { ReactNode } from "react";

import { siteContent } from "@/lib/content";

import { FloatingContactButton } from "./floating-contact-button";

import { SiteHeader } from "./site-header";

type PublicSiteFrameProps = {
  children: ReactNode;
};

export function PublicSiteFrame({ children }: PublicSiteFrameProps) {
  return (
    <div className="public-page">
      <SiteHeader brand={siteContent.brand} navigation={siteContent.navigation} />
      {children}
      <FloatingContactButton />
    </div>
  );
}
