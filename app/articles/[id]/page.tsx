import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicHeader } from '../../components/public-header';
import { SectionContents } from '../../components/section-contents';
import { articleById, type Article } from '../../data/articles';
import { benefitArticleBodies } from '../../data/benefit-articles';
import { siteSlugs, type SiteSlug } from '../../data/site-content';
import { getAllPageContent, getPageContent } from '../../lib/store';

export const dynamic = 'force-dynamic';

async function resolveArticle(id: string): Promise<{ article: Article; sourceSlug: SiteSlug | null } | null> {
  const directArticle = articleById(id);
  if (directArticle) {
    return {
      article: directArticle,
      sourceSlug: directArticle.scope === 'top' ? null : directArticle.scope,
    };
  }

  for (const slug of siteSlugs) {
    const prefix = `${slug}-`;
    if (!id.startsWith(prefix)) continue;
    const page = await getPageContent(slug);
    const section = page.sections.find((item) => item.id === id.slice(prefix.length));
    if (!section) return null;
    return {
      sourceSlug: slug,
      article: {
        id,
        scope: slug,
        title: section.title,
        excerpt: page.lead,
        date: '02.09.2026',
        body: slug === 'social-benefits'
          ? benefitArticleBodies[section.id] ?? [section.body]
          : [section.body],
        sourceUrl: 'https://example.com/',
      },
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolved = await resolveArticle((await params).id);
  return resolved ? { title: `${resolved.article.title} | Твоя служба`, description: resolved.article.excerpt } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await resolveArticle((await params).id);
  if (!resolved) notFound();
  const { article, sourceSlug } = resolved;

  const pages = await getAllPageContent();
  const sourcePage = sourceSlug ? await getPageContent(sourceSlug) : null;
  const dayImage = sourcePage?.image.day ?? '/flag-fabric-day.webp';
  const nightImage = sourcePage?.image.night ?? '/flag-fabric-night.webp';
  const backHref = sourcePage ? `/${sourcePage.slug}` : '/';

  return (
    <main className="article-page">
      <PublicHeader pages={pages} active={sourcePage?.slug} />
      <div className="article-page-media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="direction-theme-image direction-theme-image-day" src={dayImage} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="direction-theme-image direction-theme-image-night" src={nightImage} alt="" />
      </div>
      <div className="article-page-shade" aria-hidden="true" />
      <div className="page-body article-layout">
        <SectionContents page={sourcePage} activeId={article.id} />
        <article className="article-page-content" id="article-content">
          <Link className="article-back" href={backHref}>← Назад к разделу</Link>
          <header>
            <span>{article.date} / материал</span>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
          </header>
          <div className="article-page-body">
            {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <a className="article-source" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Официальный источник ↗</a>
        </article>
      </div>
    </main>
  );
}
