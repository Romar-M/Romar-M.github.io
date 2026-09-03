import Link from 'next/link';
import type { PageContent, SiteSlug } from '../data/site-content';
import { ThemeToggle } from './theme-toggle';

export function PublicHeader({ pages, active }: { pages: PageContent[]; active?: SiteSlug }) {
  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="На главную">
        <span className="status-light" aria-hidden="true" />
        <span>Служба / направления</span>
        <small>Россия / 05 разделов</small>
      </Link>
      <nav className="service-navigation" aria-label="Направления службы">
        {pages.map((page, index) => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            className={active === page.slug ? 'is-active' : undefined}
            aria-current={active === page.slug ? 'page' : undefined}
          >
            <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="nav-full">{page.slug === 'africa' ? 'АК' : page.navLabel}</span>
            <span className="nav-short">{page.slug === 'social-benefits' ? 'Льготы' : page.slug === 'territorial' ? 'Тероборона' : page.slug === 'africa' ? 'АК' : page.navLabel}</span>
          </Link>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
