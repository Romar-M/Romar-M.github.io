import Link from 'next/link';
import { articlesByScope } from '../data/articles';
import type { PageContent } from '../data/site-content';

/** Shared navigation keeps the section context when an article opens. */
export function SectionContents({ page, activeId }: { page?: PageContent | null; activeId?: string }) {
  const sections = page?.sections.map((section) => ({
    id: `${page.slug}-${section.id}`,
    title: section.title,
  })) ?? [];
  const related = articlesByScope(page?.slug ?? 'top')
    .filter((article) => !sections.some((section) => section.id === article.id));

  function articleLink(item: { id: string; title: string }) {
    return (
      <Link href={`/articles/${item.id}`} key={item.id} aria-current={activeId === item.id ? 'page' : undefined}>
        <span>{item.title}</span><span aria-hidden="true">↗</span>
      </Link>
    );
  }

  return (
    <aside className="page-toc" aria-label="Оглавление">
      <details className="page-toc-disclosure" open>
        <summary>Оглавление<span className="toc-toggle-mark" aria-hidden="true" /></summary>
        <nav aria-label={page ? 'Статьи раздела' : 'Материалы сайта'}>
          <Link className="toc-overview" href={page ? `/${page.slug}` : '/'} aria-current={!activeId ? 'page' : undefined}>
            <span>{page ? page.title : 'Главная страница'}</span><span aria-hidden="true">↗</span>
          </Link>
          {sections.map(articleLink)}
          {sections.length > 0 && related.length > 0 && <span className="toc-group-label">По теме</span>}
          {related.map(articleLink)}
        </nav>
      </details>
    </aside>
  );
}
