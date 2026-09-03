'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PageContent } from '../data/site-content';
import type { ApplicationRecord, ApplicationStatus } from '../lib/store';

type AdminTab = 'applications' | 'content';
type LoadState = 'loading' | 'ready' | 'error';

const statusLabels: Record<ApplicationStatus, string> = {
  new: 'Новая',
  contacted: 'Связались',
  processing: 'В работе',
  completed: 'Завершена',
};

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('applications');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [activeSlug, setActiveSlug] = useState('svo');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const activePage = useMemo(
    () => pages.find((page) => page.slug === activeSlug) ?? pages[0],
    [activeSlug, pages],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/applications', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/content', { cache: 'no-store' }).then((response) => response.json()),
    ])
      .then(([applicationData, contentData]) => {
        if (cancelled) return;
        setApplications(applicationData.applications ?? []);
        setPages(contentData.pages ?? []);
        setLoadState('ready');
      })
      .catch(() => !cancelled && setLoadState('error'));
    return () => { cancelled = true; };
  }, []);

  function updateLocalPage(updater: (page: PageContent) => PageContent) {
    if (!activePage) return;
    setPages((current) => current.map((page) => page.slug === activePage.slug ? updater(page) : page));
    setNotice('');
  }

  async function saveContent() {
    if (!activePage) return;
    setSaving(true);
    setNotice('');
    try {
      const response = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePage),
      });
      const result = await response.json() as { page?: PageContent; error?: string };
      if (!response.ok || !result.page) throw new Error(result.error || 'Не удалось сохранить содержание.');
      setPages((current) => current.map((page) => page.slug === result.page?.slug ? result.page : page));
      setNotice('Содержание сохранено. Изменения доступны на публичной странице.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось сохранить содержание.');
    } finally {
      setSaving(false);
    }
  }

  async function saveApplication(application: ApplicationRecord) {
    setSaving(true);
    setNotice('');
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: application.status, managerNote: application.managerNote }),
      });
      const result = await response.json() as { application?: ApplicationRecord; error?: string };
      if (!response.ok || !result.application) throw new Error(result.error || 'Не удалось обновить заявку.');
      setApplications((current) => current.map((item) => item.id === result.application?.id ? result.application : item));
      setNotice('Изменения в заявке сохранены.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось обновить заявку.');
    } finally {
      setSaving(false);
    }
  }

  function moveSection(index: number, offset: number) {
    updateLocalPage((page) => {
      const next = [...page.sections];
      const target = index + offset;
      if (target < 0 || target >= next.length) return page;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...page, sections: next };
    });
  }

  if (loadState === 'loading') {
    return <main className="admin-state"><p>Загружаем рабочие данные...</p></main>;
  }

  if (loadState === 'error') {
    return <main className="admin-state"><h1>Не удалось открыть админку</h1><p>Обновите страницу и попробуйте еще раз.</p></main>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><strong>Твоя служба</strong><span>Управление сайтом</span></Link>
        <nav aria-label="Разделы админки">
          <button type="button" className={tab === 'applications' ? 'is-active' : ''} onClick={() => { setTab('applications'); setNotice(''); }}>
            Заявки <span>{applications.length}</span>
          </button>
          <button type="button" className={tab === 'content' ? 'is-active' : ''} onClick={() => { setTab('content'); setNotice(''); }}>
            Содержание <span>{pages.length}</span>
          </button>
        </nav>
        <p>Доступ открыт на этапе разработки. Перед публикацией админку нужно защитить.</p>
      </aside>

      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <span>Рабочая область</span>
            <h1>{tab === 'applications' ? 'Заявки' : 'Содержание сайта'}</h1>
          </div>
          <Link href="/" target="_blank">Открыть сайт</Link>
        </header>

        {notice && <p className="admin-notice" role="status">{notice}</p>}

        {tab === 'applications' ? (
          <section className="applications-workspace">
            {applications.length === 0 ? (
              <div className="admin-empty"><h2>Заявок пока нет</h2><p>Новые анкеты появятся здесь после отправки с сайта.</p></div>
            ) : applications.map((application) => (
              <article className="application-row" key={application.id}>
                <div className="application-summary">
                  <time dateTime={application.createdAt}>{new Date(application.createdAt).toLocaleString('ru-RU')}</time>
                  <h2>{application.fullName}</h2>
                  <p><a href={`tel:${application.phone}`}>{application.phone}</a><span>{application.citizenship}</span><span>{application.service}</span></p>
                </div>
                <dl className="application-details">
                  <div><dt>Дата рождения</dt><dd>{application.birthDate}</dd></div>
                  <div><dt>Место проживания</dt><dd>{application.location || 'Не указано'}</dd></div>
                  <div><dt>Комментарий</dt><dd>{application.applicantNote || 'Нет комментария'}</dd></div>
                </dl>
                <div className="application-controls">
                  <label>
                    <span>Статус</span>
                    <select
                      value={application.status}
                      onChange={(event) => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: event.target.value as ApplicationStatus } : item))}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Заметка специалиста</span>
                    <textarea
                      rows={3}
                      value={application.managerNote}
                      onChange={(event) => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, managerNote: event.target.value } : item))}
                    />
                  </label>
                  <button type="button" onClick={() => saveApplication(application)} disabled={saving}>Сохранить заявку</button>
                </div>
              </article>
            ))}
          </section>
        ) : activePage ? (
          <section className="content-workspace">
            <div className="content-page-tabs" aria-label="Страницы сайта">
              {pages.map((page) => <button type="button" className={activePage.slug === page.slug ? 'is-active' : ''} key={page.slug} onClick={() => setActiveSlug(page.slug)}>{page.navLabel}</button>)}
            </div>

            <div className="content-form">
              <div className="content-fields">
                <label><span>Название вкладки</span><input value={activePage.navLabel} onChange={(event) => updateLocalPage((page) => ({ ...page, navLabel: event.target.value }))} /></label>
                <label><span>Надзаголовок</span><input value={activePage.kicker} onChange={(event) => updateLocalPage((page) => ({ ...page, kicker: event.target.value }))} /></label>
                <label><span>Заголовок страницы</span><input value={activePage.title} onChange={(event) => updateLocalPage((page) => ({ ...page, title: event.target.value }))} /></label>
                <label><span>Вводный текст</span><textarea rows={3} value={activePage.lead} onChange={(event) => updateLocalPage((page) => ({ ...page, lead: event.target.value }))} /></label>
              </div>

              <div className="toc-editor">
                <header><div><span>Оглавление и наполнение</span><h2>Разделы страницы</h2></div><button type="button" onClick={() => updateLocalPage((page) => ({ ...page, sections: [...page.sections, { id: `section-${page.sections.length + 1}`, title: 'Новый раздел', body: 'Добавьте текст раздела.' }] }))}>Добавить раздел</button></header>
                {activePage.sections.map((section, index) => (
                  <article key={`${section.id}-${index}`} className="toc-item">
                    <div className="toc-item-bar"><strong>{index + 1}</strong><div><button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label="Поднять раздел">↑</button><button type="button" onClick={() => moveSection(index, 1)} disabled={index === activePage.sections.length - 1} aria-label="Опустить раздел">↓</button><button type="button" onClick={() => updateLocalPage((page) => ({ ...page, sections: page.sections.filter((_, itemIndex) => itemIndex !== index) }))} disabled={activePage.sections.length === 1}>Удалить</button></div></div>
                    <label><span>Пункт оглавления</span><input value={section.title} onChange={(event) => updateLocalPage((page) => ({ ...page, sections: page.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} /></label>
                    <label><span>Текст раздела</span><textarea rows={5} value={section.body} onChange={(event) => updateLocalPage((page) => ({ ...page, sections: page.sections.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item) }))} /></label>
                  </article>
                ))}
              </div>

              <button className="admin-save" type="button" onClick={saveContent} disabled={saving}>{saving ? 'Сохраняем' : 'Сохранить содержание'}</button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
