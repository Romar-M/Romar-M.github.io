export type VacancySectionId = 'svo' | 'africa' | 'territorial' | 'bpls';

export type Vacancy = {
  id: string;
  title: string;
  href: string;
};

export const vacancies: Record<VacancySectionId, Vacancy[]> = {
  svo: [
    { id: 'svo-city-specialist', title: 'Специалист городского направления', href: 'https://example.com/' },
    { id: 'svo-communications', title: 'Специалист связи и управления', href: 'https://example.com/' },
    { id: 'svo-engineer', title: 'Инженер технического обеспечения', href: 'https://example.com/' },
    { id: 'svo-medic', title: 'Медицинский специалист подразделения', href: 'https://example.com/' },
  ],
  africa: [
    { id: 'africa-motor-rifle', title: 'Мотострелковые специальности', href: 'https://example.com/' },
    { id: 'africa-artillery', title: 'Артиллерийские расчёты', href: 'https://example.com/' },
    { id: 'africa-armored', title: 'Экипажи танков, БТР и БМП', href: 'https://example.com/' },
    { id: 'africa-uav', title: 'Операторы и техники БПЛА', href: 'https://example.com/' },
    { id: 'africa-drivers', title: 'Водители и механики', href: 'https://example.com/' },
    { id: 'africa-comms', title: 'Связь и IT-специалисты', href: 'https://example.com/' },
    { id: 'africa-air-defense', title: 'ПВО, РЭБ и РЭР', href: 'https://example.com/' },
    { id: 'africa-engineering', title: 'Инженерно-сапёрные специальности', href: 'https://example.com/' },
    { id: 'africa-logistics', title: 'Тыл и полевое снабжение', href: 'https://example.com/' },
    { id: 'africa-repair', title: 'Техническое обслуживание и ремонт', href: 'https://example.com/' },
    { id: 'africa-medic', title: 'Медицинские специальности', href: 'https://example.com/' },
    { id: 'africa-translators', title: 'Переводчики иностранных языков', href: 'https://example.com/' },
  ],
  territorial: [
    { id: 'territorial-bars', title: 'Военнослужащий подразделения БАРС', href: 'https://example.com/' },
    { id: 'territorial-92', title: 'Специалист 92-го полка', href: 'https://example.com/' },
    { id: 'territorial-security', title: 'Специалист охраны объектов', href: 'https://example.com/' },
    { id: 'territorial-engineer', title: 'Инженер территориальной обороны', href: 'https://example.com/' },
  ],
  bpls: [
    { id: 'bpls-operator', title: 'Оператор БПЛА', href: 'https://example.com/' },
    { id: 'bpls-technician', title: 'Техник беспилотных систем', href: 'https://example.com/' },
    { id: 'bpls-instructor', title: 'Инструктор предварительного обучения', href: 'https://example.com/' },
    { id: 'bpls-center', title: 'Специалист контракт-центра', href: 'https://example.com/' },
  ],
};

export const priorityVacancies: Vacancy[] = [
  { id: 'priority-uav', title: 'Оператор БПЛА — приоритетный набор', href: 'https://example.com/' },
  { id: 'priority-comms', title: 'Специалист связи — срочный набор', href: 'https://example.com/' },
  { id: 'priority-medic', title: 'Медицинский специалист — приоритетный набор', href: 'https://example.com/' },
];
