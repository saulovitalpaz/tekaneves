import Link from "next/link";

type SiteHeaderProps = {
  brand: { name: string; descriptor: string };
  navigation: readonly { label: string; href: string }[];
};

export function SiteHeader({ brand, navigation }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <nav aria-label="Navegação principal" className="section-shell site-header-content">
        <Link href="/" className="site-brand" aria-label="Ir para página inicial">
          <span className="site-brand-mark" aria-hidden="true">TN</span>
          <span className="site-brand-copy">
            <span className="site-brand-name display-font">{brand.name}</span>
            <span className="site-brand-descriptor">{brand.descriptor}</span>
          </span>
        </Link>
        <div className="site-nav">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
