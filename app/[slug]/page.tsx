import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DirectionActions } from '../components/direction-actions';
import { PublicHeader } from '../components/public-header';
import { isSiteSlug } from '../data/site-content';
import { priorityVacancies, vacancies, type VacancySectionId } from '../data/vacancies';
import { getAllPageContent, getPageContent } from '../lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSiteSlug(slug)) return {};
  const page = await getPageContent(slug);
  return { title: `${page.title} | Твоя служба`, description: page.lead };
}

export default async function DirectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSiteSlug(slug)) notFound();
  const [page, pages] = await Promise.all([getPageContent(slug), getAllPageContent()]);
  const isBenefits = slug === 'social-benefits';
  const sectionVacancies = isBenefits ? [] : vacancies[slug as VacancySectionId];

  return (
    <main className="direction-page">
      <PublicHeader pages={pages} active={slug} />
      <div className="direction-page-media" aria-hidden="true">
        {/* Plain images avoid the current vinext/next-image client hydration issue. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="direction-theme-image direction-theme-image-day" src={page.image.day} alt="" style={{ objectPosition: page.image.position }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="direction-theme-image direction-theme-image-night" src={page.image.night} alt="" style={{ objectPosition: page.image.position }} />
      </div>
      <div className="direction-page-overlay" aria-hidden="true" />
      <section className="direction-hero direction-hero-extended">
        <div className="direction-hero-copy">
          <p>{page.kicker}</p>
          <h1>{page.title}</h1>
          <span>{page.lead}</span>
        </div>
      </section>

      <div className="page-body">
        <aside className="page-toc">
          <strong>Материалы раздела</strong>
          <nav aria-label="Статьи раздела">
            {page.sections.map((section) => (
              <Link href={`/articles/${page.slug}-${section.id}`} key={section.id}>
                {section.title}<span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </aside>
        <article className="page-copy page-overview">
          <section>
            <span className="page-overview-label">Кратко о разделе</span>
            <h2>Общая информация</h2>
            <p>{page.lead}</p>
            <p>{page.sections[0]?.body}</p>
            <p className="page-overview-note">Подробные материалы открываются отдельными страницами по ссылкам слева.</p>
          </section>
          <DirectionActions
            service={page.navLabel}
            vacancies={sectionVacancies}
            priorityVacancies={slug === 'svo' ? priorityVacancies : []}
            isBenefits={isBenefits}
          />
        </article>
      </div>

      <footer className="site-footer">
        <p>Информация на сайте носит справочный характер. Актуальные условия уточняйте у специалиста.</p>
        <Link href="/">Все направления</Link>
      </footer>
    </main>
  );
}
