type SiteFooterProps = {
  brand: string;
  copy: string;
};

export function SiteFooter({ brand, copy }: SiteFooterProps) {
  return <footer className="site-footer"><div className="section-shell footer-content"><span className="footer-brand">{brand}</span><span>{copy}</span></div></footer>;
}
