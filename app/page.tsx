'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { articlesByScope, type Article, type ArticleScope } from './data/articles';
import {
  applicationOptions,
  sections,
  type ApplicationOption,
  type ServiceSection,
} from './data/sections';
import type { VacancySectionId } from './data/vacancies';

type Theme = 'light' | 'dark';
type FormRequest = { service: ApplicationOption; sectionTitle: string };

const mainScreenIds = ['top', ...sections.map((section) => section.id)];
const navigationKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
]);

function ArrowIcon({ direction = 'up' }: { direction?: 'up' | 'down' }) {
  return <span aria-hidden="true">{direction === 'up' ? '↗' : '↓'}</span>;
}

function compactSectionTitle(section: ServiceSection) {
  if (section.id === 'social-benefits') return 'Соцльготы';
  if (section.id === 'africa') return 'АК';
  if (section.id === 'territorial') return 'Тероборона';
  return section.title;
}

function getFocusable(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('hidden'));
}

function useDialogFocus(
  isOpen: boolean,
  dialogRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  returnFocusRef: React.RefObject<HTMLElement | null>,
) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const returnTarget = returnFocusRef.current;
    const focusable = getFocusable(dialog);
    window.setTimeout(() => (focusable[0] ?? dialog)?.focus({ preventScroll: true }), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== 'Tab') return;
      const items = getFocusable(dialogRef.current);
      if (!items.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.setTimeout(() => returnTarget?.focus({ preventScroll: true }), 0);
    };
  }, [dialogRef, isOpen, returnFocusRef]);
}

function WavingFlag({ theme }: { theme: Theme | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !theme) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = theme === 'dark' ? '/flag-fabric-night.webp' : '/flag-fabric-day.webp';

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let loaded = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    };

    const draw = (time: number) => {
      if (!loaded || !image.naturalWidth || !width || !height) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      const imageAspect = image.naturalWidth / image.naturalHeight;
      const canvasAspect = width / height;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;

      if (imageAspect > canvasAspect) {
        sourceWidth = image.naturalHeight * canvasAspect;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / canvasAspect;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      const seconds = time / 1000;
      const amplitude = reducedMotion ? 0 : Math.max(9, Math.min(17, width * 0.008));
      const sliceWidth = 4;
      const slices = Math.ceil(width / sliceWidth);
      const sourceSliceWidth = sourceWidth / slices;
      const verticalPadding = 28;

      for (let index = 0; index < slices; index += 1) {
        const progress = index / Math.max(1, slices - 1);
        const phase = progress * Math.PI * 3.35 - seconds * 0.76;
        const wave =
          Math.sin(phase) * amplitude +
          Math.sin(phase * 0.56 + seconds * 0.38) * amplitude * 0.34 +
          Math.sin(phase * 1.82 - seconds * 0.24) * amplitude * 0.12;
        const fold = 1 + Math.cos(phase) * 0.008;
        const destinationX = index * sliceWidth;
        const destinationWidth = Math.min(sliceWidth, width - destinationX) + 1.8;

        context.drawImage(
          image,
          sourceX + index * sourceSliceWidth,
          sourceY,
          sourceSliceWidth + 0.9,
          sourceHeight,
          destinationX - 0.6,
          -verticalPadding + wave,
          destinationWidth,
          (height + verticalPadding * 2) * fold,
        );
      }

      if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion && loaded) draw(0);
    });
    resizeObserver.observe(canvas);
    resize();

    const handleLoad = () => {
      loaded = true;
      canvas.dataset.loaded = 'true';
      draw(0);
    };
    image.addEventListener('load', handleLoad, { once: true });
    if (image.complete && image.naturalWidth) handleLoad();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      image.removeEventListener('load', handleLoad);
      delete canvas.dataset.loaded;
    };
  }, [theme]);

  return (
    <div className="hero-flag" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

function ThemeBackdrop({ section, theme }: { section: ServiceSection; theme: Theme | null }) {
  const [loadedSource, setLoadedSource] = useState('');
  const source = theme ? section.images[theme === 'dark' ? 'night' : 'day'] : '';

  return (
    <div className="section-media" aria-hidden="true">
      {source && (
        <>
          {/* The explicit lazy image keeps the neutral section surface in place until the selected theme asset is ready. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={source}
            className={loadedSource === source ? 'is-loaded' : ''}
            src={source}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            style={{ objectPosition: section.imagePosition }}
            onLoad={() => setLoadedSource(source)}
          />
        </>
      )}
    </div>
  );
}

function ThemeToggle({ busy, onToggle }: { busy: boolean; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Переключить светлую и тёмную тему"
      aria-busy={busy}
      disabled={busy}
      onClick={onToggle}
    >
      <span className="theme-toggle-label">Тема</span>
      <span className="theme-toggle-track" aria-hidden="true"><span /></span>
    </button>
  );
}

function ArticleCards({
  scope,
  compact = false,
}: {
  scope: ArticleScope;
  compact?: boolean;
}) {
  return (
    <div className={`article-strip ${compact ? 'is-compact' : ''}`} aria-label="Статьи по теме">
      {articlesByScope(scope).map((article) => (
        <Link
          className="article-card"
          key={article.id}
          href={`/articles/${article.id}`}
        >
          <span className="article-date">{article.date}</span>
          <strong>{article.title}</strong>
          <span className="article-excerpt">{article.excerpt}</span>
          <span className="article-read">Читать <ArrowIcon /></span>
        </Link>
      ))}
    </div>
  );
}

function AfricaProfile() {
  const benefits = [
    'Стабильное денежное довольствие',
    'Форма, питание и проживание',
    'Медицинское и страховое обеспечение',
    'Подготовка и поддержка командования',
  ];

  return (
    <aside className="africa-profile" aria-label="Ключевые условия службы в Африканском корпусе">
      <div className="africa-profile-intro">
        <span>АК / КРАТКОЕ ДОСЬЕ</span>
        <p>Официальная контрактная служба в составе подразделения Минобороны России на африканском направлении.</p>
      </div>
      <dl className="africa-facts">
        <div><dt>от 1 года</dt><dd>срок контракта</dd></div>
        <div><dt>6+ месяцев</dt><dd>период командировки</dd></div>
        <div><dt>18–45 лет</dt><dd>для специалистов — до 50</dd></div>
      </dl>
      <ul className="africa-benefits">
        {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
      </ul>
    </aside>
  );
}

function ArticleModal({
  article,
  onClose,
  returnFocusRef,
}: {
  article: Article | null;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(Boolean(article), dialogRef, onClose, returnFocusRef);

  if (!article) return null;

  return (
    <div
      className="article-modal"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <article
        className="article-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`article-title-${article.id}`}
        aria-describedby={`article-summary-${article.id}`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть статью">×</button>
        <header className="article-dialog-heading">
          <span>{article.date} / материал</span>
          <h2 id={`article-title-${article.id}`}>{article.title}</h2>
          <p id={`article-summary-${article.id}`}>{article.excerpt}</p>
        </header>
        <div className="article-body">
          {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <a
          className="official-source"
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Официальный источник <ArrowIcon />
        </a>
      </article>
    </div>
  );
}

function ApplicationModal({
  request,
  onClose,
  returnFocusRef,
}: {
  request: FormRequest | null;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<ApplicationOption>(
    () => request?.service ?? applicationOptions[0],
  );
  const [sent, setSent] = useState(false);
  useDialogFocus(Boolean(request), dialogRef, onClose, returnFocusRef);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
    setSelectedService(request?.service ?? applicationOptions[0]);
  }

  if (!request) return null;

  return (
    <div className="form-modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть форму">×</button>
        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <span className="form-kicker">Первый шаг / {request.sectionTitle}</span>
              <h2 id="application-title">Подать заявку</h2>
            </div>
            <span className="form-mark" aria-hidden="true" />
          </div>

          <label>
            <span>ФИО</span>
            <input name="name" type="text" placeholder="Иванов Иван Иванович" autoComplete="name" required />
          </label>
          <label>
            <span>Телефон</span>
            <input
              name="phone"
              type="tel"
              placeholder="+7 900 000-00-00"
              autoComplete="tel"
              inputMode="tel"
              pattern="[+0-9 ()-]{10,}"
              required
            />
          </label>
          <label>
            <span>Желаемая служба</span>
            <select
              name="service"
              value={selectedService}
              onChange={(event) => setSelectedService(event.target.value as ApplicationOption)}
              required
            >
              {applicationOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <button type="submit">
            Отправить заявку <ArrowIcon />
          </button>

          <p className="privacy-note">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
          {sent && (
            <p className="form-success" role="status">
              Данные формы проверены. Отправка станет активна после подключения почты.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function DirectionSection({
  section,
  index,
  theme,
}: {
  section: ServiceSection;
  index: number;
  theme: Theme | null;
}) {
  const reverse = index % 2 === 1;

  return (
    <section id={section.id} className={`direction-section ${reverse ? 'is-reverse' : ''}`}>
      <ThemeBackdrop section={section} theme={theme} />
      <div className="section-overlay" aria-hidden="true" />
      <div className="section-orbit" aria-hidden="true"><span>{section.number}</span></div>

      <div
        className="section-directions-bar"
        aria-label={`Направления: ${section.title}`}
        style={{ '--section-accent': section.accent } as CSSProperties}
      >
        <h2 className="section-directions-title">{compactSectionTitle(section)}</h2>
        <div>
          {section.directions.map((direction) => (
            <Link href={direction.href ?? `/${section.id}`} key={direction.label}>
              <span>{direction.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="section-copy">
        <div className="eyebrow-row">
          <span className="eyebrow-dot" style={{ backgroundColor: section.accent }} />
          <span>{section.eyebrow}</span>
        </div>
        <p className="section-lead">{section.lead}</p>
        <p className="section-description">{section.description}</p>
        {section.id === 'africa' && <AfricaProfile />}
      </div>

      <ArticleCards scope={section.articleScope} compact />
    </section>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [themeBusy, setThemeBusy] = useState(false);
  const [activeSection, setActiveSection] = useState<ServiceSection['id'] | null>(null);
  const [openVacancies, setOpenVacancies] = useState<VacancySectionId | null>(null);
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [formRequest, setFormRequest] = useState<FormRequest | null>(null);
  const articleReturnFocusRef = useRef<HTMLElement | null>(null);
  const formReturnFocusRef = useRef<HTMLElement | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticFrameRef = useRef<number | null>(null);
  const previousScrollBehaviorRef = useRef<string | null>(null);
  const programmaticScrollRef = useRef(false);
  const restoringScrollRef = useRef(false);
  const interactionLockedRef = useRef(false);
  const snapPauseUntilRef = useRef(0);

  const interactionLocked = Boolean(openArticle || formRequest || openVacancies);

  useEffect(() => {
    interactionLockedRef.current = interactionLocked;
  }, [interactionLocked]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const stored = window.localStorage.getItem('service-theme');
    const initial = (root.dataset.theme ?? stored ?? (media.matches ? 'dark' : 'light')) as Theme;
    root.dataset.theme = initial;
    root.style.colorScheme = initial;
    const initialFrame = window.requestAnimationFrame(() => setTheme(initial));

    const followSystem = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem('service-theme')) return;
      const next = event.matches ? 'dark' : 'light';
      root.dataset.theme = next;
      root.style.colorScheme = next;
      setTheme(next);
    };
    media.addEventListener('change', followSystem);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      media.removeEventListener('change', followSystem);
    };
  }, []);

  const preloadTheme = useCallback(async (nextTheme: Theme) => {
    const imagePaths = [
      nextTheme === 'dark' ? '/flag-fabric-night.webp' : '/flag-fabric-day.webp',
      ...sections.map((section) => section.images[nextTheme === 'dark' ? 'night' : 'day']),
    ];
    await Promise.all(imagePaths.map((src) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
    })));
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!theme || themeBusy) return;
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeBusy(true);
    await preloadTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem('service-theme', next);
    setTheme(next);
    window.setTimeout(() => setThemeBusy(false), 260);
  }, [preloadTheme, theme, themeBusy]);

  const cancelProgrammaticScroll = useCallback(() => {
    if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
    if (programmaticFrameRef.current !== null) window.cancelAnimationFrame(programmaticFrameRef.current);
    programmaticFrameRef.current = null;
    if (previousScrollBehaviorRef.current !== null) {
      document.documentElement.style.scrollBehavior = previousScrollBehaviorRef.current;
      previousScrollBehaviorRef.current = null;
    }
    programmaticScrollRef.current = false;
  }, []);

  const scrollToScreen = useCallback((id: string, updateHash = true) => {
    cancelProgrammaticScroll();
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const top = Math.max(0, target.offsetTop - (id === 'top' ? 0 : headerHeight));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (updateHash) window.history.replaceState(null, '', id === 'top' ? window.location.pathname : `#${id}`);
    const root = document.documentElement;
    previousScrollBehaviorRef.current = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    if (reducedMotion) {
      window.scrollTo({ top, behavior: 'auto' });
      snapPauseUntilRef.current = Date.now() + 500;
      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehaviorRef.current ?? '';
        previousScrollBehaviorRef.current = null;
      });
      return;
    }

    const startTop = window.scrollY;
    const distance = top - startTop;
    if (Math.abs(distance) < 2) return;
    const startedAt = performance.now();
    const duration = Math.min(1250, Math.max(720, Math.abs(distance) * .42));
    programmaticScrollRef.current = true;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = progress < .5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo({ top: startTop + distance * eased, behavior: 'auto' });
      if (progress < 1) {
        programmaticFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }
      programmaticFrameRef.current = null;
      programmaticScrollRef.current = false;
      root.style.scrollBehavior = previousScrollBehaviorRef.current ?? '';
      previousScrollBehaviorRef.current = null;
      snapPauseUntilRef.current = Date.now() + 900;
    };
    programmaticFrameRef.current = window.requestAnimationFrame(animate);
  }, [cancelProgrammaticScroll]);

  const handleNavigation = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setOpenVacancies(null);
    scrollToScreen(id);
  }, [scrollToScreen]);

  useEffect(() => {
    const visible = new Set<string>();
    const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const nearest = sections
          .filter((section) => visible.has(section.id))
          .map((section) => ({
            id: section.id,
            distance: Math.abs((document.getElementById(section.id)?.getBoundingClientRect().top ?? 0) - headerHeight),
          }))
          .sort((a, b) => a.distance - b.distance)[0];
        setActiveSection(nearest?.id ?? null);
      },
      { rootMargin: `-${headerHeight}px 0px -48% 0px`, threshold: [0, 0.15, 0.35] },
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const maybeSnap = () => {
      if (interactionLockedRef.current || programmaticScrollRef.current) return;
      const remainingPause = snapPauseUntilRef.current - Date.now();
      if (remainingPause > 0) {
        scrollIdleTimerRef.current = window.setTimeout(maybeSnap, remainingPause + 20);
        return;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < 8 || maxScroll - window.scrollY < 8) return;
      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
      const nearest = mainScreenIds
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;
          const desiredTop = Math.max(0, element.offsetTop - (id === 'top' ? 0 : headerHeight));
          return { id, desiredTop, distance: Math.abs(window.scrollY - desiredTop) };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => a.distance - b.distance)[0];
      if (!nearest || nearest.distance < 8) return;
      scrollToScreen(nearest.id, false);
    };

    const handleScroll = () => {
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
      if (interactionLockedRef.current || programmaticScrollRef.current || restoringScrollRef.current) return;
      scrollIdleTimerRef.current = window.setTimeout(maybeSnap, 1000);
    };

    const cancelForUser = () => {
      snapPauseUntilRef.current = Date.now() + 1100;
      cancelProgrammaticScroll();
    };
    const cancelForKey = (event: KeyboardEvent) => {
      if (navigationKeys.has(event.key)) cancelForUser();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', cancelForUser, { passive: true });
    window.addEventListener('touchstart', cancelForUser, { passive: true });
    window.addEventListener('pointerdown', cancelForUser, { passive: true });
    window.addEventListener('keydown', cancelForKey);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', cancelForUser);
      window.removeEventListener('touchstart', cancelForUser);
      window.removeEventListener('pointerdown', cancelForUser);
      window.removeEventListener('keydown', cancelForKey);
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
      if (programmaticFrameRef.current !== null) window.cancelAnimationFrame(programmaticFrameRef.current);
    };
  }, [cancelProgrammaticScroll, scrollToScreen]);

  useEffect(() => {
    if (!interactionLocked) return;
    cancelProgrammaticScroll();
  }, [cancelProgrammaticScroll, interactionLocked]);

  useEffect(() => {
    const modalOpen = Boolean(openArticle || formRequest);
    if (!modalOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
      snapPauseUntilRef.current = Date.now() + 1800;
      restoringScrollRef.current = true;
      Object.assign(body.style, previous);
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
        restoringScrollRef.current = false;
      });
    };
  }, [formRequest, openArticle]);

  useEffect(() => {
    if (!openVacancies) return;
    const closeVacancies = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-vacancy-owner="${openVacancies}"]`)) setOpenVacancies(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenVacancies(null);
      document.querySelector<HTMLButtonElement>(`[data-vacancy-owner="${openVacancies}"] .vacancies-toggle`)?.focus();
    };
    window.addEventListener('pointerdown', closeVacancies);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeVacancies);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [openVacancies]);

  return (
    <main id="page-root">
      <a className="skip-link" href="#top">Перейти к содержимому</a>
      <header className="site-header">
        <a className="site-brand" href="#top" onClick={(event) => handleNavigation(event, 'top')} aria-label="Вернуться на главный экран">
          <span className="status-light" aria-hidden="true" />
          <span>Служба / направления</span>
          <small>Россия / 05 разделов</small>
        </a>
        <nav className="service-navigation" aria-label="Основные направления">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/${section.id}`}
              className={activeSection === section.id ? 'is-active' : ''}
              aria-current={activeSection === section.id ? 'location' : undefined}
            >
              <span className="nav-number">{section.number}</span>
              <span className="nav-full">{compactSectionTitle(section)}</span>
              <span className="nav-short">{compactSectionTitle(section)}</span>
            </Link>
          ))}
        </nav>
        <ThemeToggle busy={themeBusy} onToggle={toggleTheme} />
      </header>

      <section id="top" className="hero" tabIndex={-1}>
        <WavingFlag theme={theme} />
        <div className="hero-spotlights" aria-hidden="true" />
        <div className="hero-stamp" aria-hidden="true"><span>СЛУЖБА</span><span>ЧЕСТЬ</span><span>РОДИНА</span></div>
        <div className="hero-content">
          <div className="hero-classification"><span>Открытый набор</span><span>2026</span><span>RU / 05</span></div>
          <p className="hero-kicker"><span /> Служба по контракту</p>
          <h1>ТВОЯ СИЛА.<br /><em>ТВОЙ ВЫБОР.</em></h1>
          <p className="hero-subtitle">Четыре направления и социальная поддержка.<br />Выберите раздел, который подходит именно вам.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#social-benefits" onClick={(event) => handleNavigation(event, 'social-benefits')}>Выбрать раздел <ArrowIcon /></a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="target-cross target-cross-a" />
          <div className="target-cross target-cross-b" />
          <div className="radar-circle radar-one" />
          <div className="radar-circle radar-two" />
          <div className="radar-line" />
          <div className="hero-number">05</div>
        </div>
        <div className="hero-articles"><ArticleCards scope="top" /></div>
      </section>

      {sections.map((section, index) => (
        <DirectionSection
          key={section.id}
          section={section}
          index={index}
          theme={theme}
        />
      ))}

      <footer>
        <span className="footer-code">СЛУЖБА / 05</span>
        <div className="footer-notice">
          <span>Информационный проект о направлениях контрактной службы</span>
          <strong>Использование материалов сайта третьими лицами в личных или коммерческих целях, копирование, публикация и распространение без письменного разрешения правообладателя запрещены.</strong>
        </div>
        <a className="to-top" href="#top" onClick={(event) => handleNavigation(event, 'top')}>Наверх ↑</a>
      </footer>

      <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} returnFocusRef={articleReturnFocusRef} />
      <ApplicationModal
        key={formRequest?.service ?? 'closed'}
        request={formRequest}
        onClose={() => setFormRequest(null)}
        returnFocusRef={formReturnFocusRef}
      />
    </main>
  );
}
