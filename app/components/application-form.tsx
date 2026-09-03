'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import type { PageContent } from '../data/site-content';

type FormState = 'idle' | 'sending' | 'success' | 'error';

function getSuggestedDirections(pages: PageContent[], answers: Record<string, FormDataEntryValue>) {
  const directions = pages.filter((page) => page.slug !== 'social-benefits');
  const selectedService = String(answers.service ?? '');

  return [...directions].sort((first, second) => {
    if (first.navLabel === selectedService) return -1;
    if (second.navLabel === selectedService) return 1;
    return 0;
  });
}

export function ApplicationForm({ pages, initialService }: { pages: PageContent[]; initialService: string }) {
  const [state, setState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [suggestedDirections, setSuggestedDirections] = useState<PageContent[]>([]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Не удалось отправить заявку.');
      setSuggestedDirections(getSuggestedDirections(pages, data));
      form.reset();
      setState('success');
      setMessage('Анкета принята. Специалист свяжется с вами по указанному телефону.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
    }
  }

  if (state === 'success') {
    return (
      <section className="form-result" role="status">
        <span className="form-result-mark" aria-hidden="true">✓</span>
        <h1>Заявка отправлена</h1>
        <p>{message}</p>
        <div className="suggested-directions" aria-labelledby="suggested-title">
          <header>
            <span>Предварительный результат</span>
            <h2 id="suggested-title">По вашим данным подходят следующие направления</h2>
            <p>Пока список носит общий характер. Точное направление специалист подберет после консультации.</p>
          </header>
          <div>
            {suggestedDirections.map((page) => (
              <Link href={`/${page.slug}`} key={page.slug}>
                <strong>{page.navLabel}</strong>
                <span>Подробнее</span>
              </Link>
            ))}
          </div>
        </div>
        <Link className="secondary-button" href="/">Вернуться на главную</Link>
      </section>
    );
  }

  return (
    <form className="questionnaire" onSubmit={submit}>
      <header className="questionnaire-heading">
        <p>Анкета кандидата</p>
        <h1>Первичная заявка</h1>
        <span>Поля со звездочкой обязательны. На следующем этапе данные уточнит специалист.</span>
      </header>

      <div className="form-grid">
        <label className="field field-wide">
          <span>ФИО *</span>
          <input name="fullName" type="text" autoComplete="name" placeholder="Иванов Иван Иванович" minLength={5} required />
        </label>
        <label className="field">
          <span>Дата рождения *</span>
          <input name="birthDate" type="date" autoComplete="bday" required />
        </label>
        <label className="field">
          <span>Гражданство *</span>
          <input name="citizenship" type="text" autoComplete="country-name" placeholder="Российская Федерация" required />
        </label>
        <label className="field">
          <span>Телефон для связи *</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" pattern="[+0-9 ()-]{10,}" required />
        </label>
        <label className="field">
          <span>Направление</span>
          <select name="service" defaultValue={initialService}>
            <option value="">Не выбрано</option>
            {pages
              .filter((page) => page.slug !== 'social-benefits')
              .map((page) => <option key={page.slug} value={page.navLabel}>{page.navLabel}</option>)}
          </select>
        </label>
        <label className="field field-wide">
          <span>Место проживания</span>
          <input name="location" type="text" autoComplete="address-level2" placeholder="Город или район" />
        </label>
        <label className="field field-wide">
          <span>Комментарий</span>
          <textarea name="applicantNote" rows={4} placeholder="Опыт, специальность или вопрос специалисту" />
        </label>
      </div>

      <label className="consent-field">
        <input name="consent" type="checkbox" required />
        <span>Согласен на обработку указанных персональных данных для связи по заявке.</span>
      </label>

      {state === 'error' && <p className="form-error" role="alert">{message}</p>}
      <button className="primary-button form-submit" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Отправляем' : 'Отправить заявку'}
      </button>
    </form>
  );
}
