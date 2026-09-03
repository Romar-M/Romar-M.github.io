'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Vacancy } from '../data/vacancies';

type MenuName = 'vacancies' | 'priority' | null;

export function DirectionActions({
  service,
  vacancies,
  priorityVacancies = [],
  isBenefits = false,
}: {
  service: string;
  vacancies: Vacancy[];
  priorityVacancies?: Vacancy[];
  isBenefits?: boolean;
}) {
  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const applicationHref = isBenefits ? '/application' : `/application?service=${encodeURIComponent(service)}`;

  function vacancyButton(label: string, name: Exclude<MenuName, null>, items: Vacancy[]) {
    const isOpen = openMenu === name;
    return (
      <div className="direction-action-menu">
        <button
          className="secondary-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls={`direction-${name}-menu`}
          onClick={() => setOpenMenu(isOpen ? null : name)}
        >
          {label}<span className="menu-chevron" aria-hidden="true">⌄</span>
        </button>
        {isOpen && (
          <div className="direction-vacancy-list" id={`direction-${name}-menu`} role="menu">
            {items.map((item) => (
              <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" role="menuitem">
                {item.title}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="direction-actions" ref={rootRef}>
      <Link className="primary-button" href={applicationHref}>
        {isBenefits ? 'Получить консультацию' : 'Подать заявку'}
      </Link>
      {!isBenefits && vacancyButton('Актуальные вакансии', 'vacancies', vacancies)}
      {priorityVacancies.length > 0 && vacancyButton('Приоритетные вакансии', 'priority', priorityVacancies)}
    </div>
  );
}
