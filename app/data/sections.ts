import type { ArticleScope } from './articles';

export type ServiceSection = {
  id: Exclude<ArticleScope, 'top'>;
  articleScope: ArticleScope;
  eyebrow: string;
  title: string;
  lead: string;
  description: string;
  number: string;
  accent: string;
  directions: { label: string; formValue?: string; href?: string }[];
  facts: { value: string; label: string }[];
  images: { day: string; night: string };
  imagePosition: string;
};

export const sections: ServiceSection[] = [
  {
    id: 'social-benefits',
    articleScope: 'social-benefits',
    eyebrow: 'Поддержка участников и семей',
    title: 'Социальные льготы',
    lead: 'Основные меры поддержки — в одном понятном маршруте.',
    description:
      'Выплаты, помощь семье, жильё, здоровье, образование и трудоустройство собраны по направлениям. Актуальные условия уточняются по месту обращения.',
    number: '01',
    accent: '#b7cb67',
    directions: [
      { label: 'Выплаты', href: '/social-benefits#payments' },
      { label: 'Семья', href: '/social-benefits#family' },
      { label: 'Жильё', href: '/social-benefits#housing' },
      { label: 'Здоровье', href: '/social-benefits#health' },
      { label: 'Образование', href: '/social-benefits#education' },
    ],
    facts: [
      { value: '05', label: 'направлений поддержки' },
      { value: '01', label: 'единый раздел' },
      { value: '→', label: 'понятный маршрут' },
    ],
    images: { day: '/bg-social-benefits-day.webp', night: '/bg-social-benefits-night.webp' },
    imagePosition: 'center center',
  },
  {
    id: 'svo',
    articleScope: 'svo',
    eyebrow: 'Контрактная служба',
    title: 'СВО',
    lead: 'Три направления. Чёткая задача. Надёжная команда.',
    description:
      'Городские задачи, фронтовые направления и защита объектов объединены в один блок с единым маршрутом подготовки.',
    number: '02',
    accent: '#b7cb67',
    directions: [
      { label: 'Города', formValue: 'СВО — Города' },
      { label: 'Фронт', formValue: 'СВО — Фронт' },
      { label: 'Защита', formValue: 'СВО — Защита' },
    ],
    facts: [
      { value: '03', label: 'направления службы' },
      { value: '24/7', label: 'поддержка подразделения' },
      { value: '01', label: 'общая система подготовки' },
    ],
    images: { day: '/bg-svo-day.webp', night: '/bg-svo-night.webp' },
    imagePosition: 'center center',
  },
  {
    id: 'africa',
    articleScope: 'africa',
    eyebrow: 'Международное направление',
    title: 'Африканский корпус',
    lead: 'Контрактная служба на африканском направлении.',
    description:
      'Российское воинское подразделение, сформированное при Минобороны России для выполнения задач и защиты российских интересов в государствах Африки.',
    number: '03',
    accent: '#c98351',
    directions: [
      { label: 'Боевые подразделения', formValue: 'Африканский корпус' },
      { label: 'Технические специалисты', formValue: 'Африканский корпус' },
      { label: 'Обеспечение', formValue: 'Африканский корпус' },
    ],
    facts: [
      { value: '1+', label: 'год действия контракта' },
      { value: '6+', label: 'месяцев командировки' },
      { value: '18–45', label: 'основной возраст отбора' },
    ],
    images: { day: '/bg-africa-day.webp', night: '/bg-africa-night.webp' },
    imagePosition: 'center center',
  },
  {
    id: 'territorial',
    articleScope: 'territorial',
    eyebrow: 'Безопасность территорий',
    title: 'Территориальная оборона',
    lead: 'Подготовленный резерв и защита важных объектов.',
    description:
      'Два направления для службы в подразделениях территориальной обороны с акцентом на слаженность, наблюдение и устойчивую связь.',
    number: '04',
    accent: '#d4b76d',
    directions: [
      { label: 'БАРС', formValue: 'Территориальная оборона — БАРС' },
      { label: '92-й полк', formValue: 'Территориальная оборона — 92-й полк' },
    ],
    facts: [
      { value: '02', label: 'направления отбора' },
      { value: '24/7', label: 'дежурный контур' },
      { value: '01', label: 'приоритет — безопасность' },
    ],
    images: { day: '/bg-territorial-day.webp', night: '/bg-territorial-night.webp' },
    imagePosition: 'center center',
  },
  {
    id: 'bpls',
    articleScope: 'bpls',
    eyebrow: 'Беспилотные системы',
    title: 'БПЛС',
    lead: 'Техника, обучение и точная работа оператора.',
    description:
      'Направление объединяет подготовку операторов, работу контракт-центра и предварительное техническое обучение.',
    number: '05',
    accent: '#7fb0a5',
    directions: [
      { label: 'БПЛА', formValue: 'БПЛС — БПЛА' },
      { label: 'Контракт-центр', formValue: 'БПЛС — Контракт-центр' },
      { label: 'Предварительное обучение', formValue: 'БПЛС — Предварительное обучение' },
    ],
    facts: [
      { value: '03', label: 'этапа входа' },
      { value: '01', label: 'техническая специализация' },
      { value: '∞', label: 'ценность точности' },
    ],
    images: { day: '/bg-bpls-day.webp', night: '/bg-bpls-night.webp' },
    imagePosition: 'center center',
  },
];

export const applicationOptions = [
  'СВО — Города',
  'СВО — Фронт',
  'СВО — Защита',
  'Африканский корпус',
  'Территориальная оборона — БАРС',
  'Территориальная оборона — 92-й полк',
  'БПЛС — БПЛА',
  'БПЛС — Контракт-центр',
  'БПЛС — Предварительное обучение',
] as const;

export type ApplicationOption = (typeof applicationOptions)[number];
