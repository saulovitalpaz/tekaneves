type SiteHeaderProps = {
  brand: { name: string; descriptor: string };
  navigation: readonly { label: string; href: string }[];
};

export function SiteHeader({ brand, navigation }: SiteHeaderProps) {
  return (
    <header className="section-shell" style={{ paddingTop: "1.25rem" }}>
      <nav aria-label="Navegação principal" className="flex items-center justify-between gap-6">
        <a href="#sobre" className="flex shrink-0 items-center gap-3" aria-label="Ir para sobre">
          <span className="grid size-12 place-items-center rounded-full border border-[var(--forest)] text-xl text-[var(--forest)]" aria-hidden="true">TN</span>
          <span className="hidden sm:block">
            <span className="block display-font text-2xl text-[var(--forest-deep)]">{brand.name}</span>
            <span className="block text-[0.58rem] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">{brand.descriptor}</span>
          </span>
        </a>
        <div className="hidden items-center gap-6 text-sm text-[var(--ink)] lg:flex">
          {navigation.map((item) => <a key={item.href} href={item.href} className="transition-colors hover:text-[var(--gold)]">{item.label}</a>)}
          <a className="button-primary site-header-cta" href="#contato">Falar comigo</a>
        </div>
        <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] xl:block">Psicoterapia</span>
      </nav>
    </header>
  );
}
