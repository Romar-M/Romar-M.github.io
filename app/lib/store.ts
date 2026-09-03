import { env } from 'cloudflare:workers';
import {
  cloneDefaultPage,
  defaultPages,
  isSiteSlug,
  siteSlugs,
  type ContentSection,
  type PageContent,
  type SiteSlug,
} from '../data/site-content';

export const applicationStatuses = ['new', 'contacted', 'processing', 'completed'] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export type ApplicationRecord = {
  id: string;
  createdAt: string;
  fullName: string;
  birthDate: string;
  citizenship: string;
  phone: string;
  service: string;
  location: string;
  applicantNote: string;
  status: ApplicationStatus;
  managerNote: string;
};

type D1Result<T> = { results?: T[] };
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  all: <T>() => Promise<D1Result<T>>;
  first: <T>() => Promise<T | null>;
  run: () => Promise<unknown>;
};
type D1DatabaseLike = { prepare: (query: string) => D1Statement };

type MutableStore = {
  applications: ApplicationRecord[];
  content: Partial<Record<SiteSlug, PageContent>>;
};

const memoryKey = '__contractServiceStore';

function memoryStore(): MutableStore {
  const root = globalThis as typeof globalThis & { [memoryKey]?: MutableStore };
  root[memoryKey] ??= { applications: [], content: {} };
  return root[memoryKey];
}

function getDatabase(): D1DatabaseLike | null {
  try {
    return ((env as unknown as { DB?: D1DatabaseLike }).DB ?? null);
  } catch {
    return null;
  }
}

function parseSections(value: string, fallback: ContentSection[]): ContentSection[] {
  try {
    const parsed = JSON.parse(value) as ContentSection[];
    if (!Array.isArray(parsed) || !parsed.length) return fallback;
    return parsed
      .filter((section) => section && typeof section.id === 'string')
      .map((section) => ({
        id: section.id,
        title: String(section.title ?? ''),
        body: String(section.body ?? ''),
      }));
  } catch {
    return fallback;
  }
}

type ContentRow = {
  slug: string;
  nav_label: string;
  kicker: string;
  title: string;
  lead: string;
  sections_json: string;
};

function rowToPage(row: ContentRow): PageContent | null {
  if (!isSiteSlug(row.slug)) return null;
  const fallback = defaultPages[row.slug];
  return {
    ...fallback,
    navLabel: row.nav_label,
    kicker: row.kicker,
    title: row.title,
    lead: row.lead,
    sections: parseSections(row.sections_json, fallback.sections),
  };
}

export async function getAllPageContent(): Promise<PageContent[]> {
  const database = getDatabase();
  if (database) {
    try {
      const response = await database.prepare(
        'SELECT slug, nav_label, kicker, title, lead, sections_json FROM site_content',
      ).all<ContentRow>();
      const saved = new Map(
        (response.results ?? [])
          .map(rowToPage)
          .filter((page): page is PageContent => Boolean(page))
          .map((page) => [page.slug, page]),
      );
      return siteSlugs.map((slug) => saved.get(slug) ?? cloneDefaultPage(slug));
    } catch {
      // Local preview can start before the local migration is applied.
    }
  }

  const memory = memoryStore().content;
  return siteSlugs.map((slug) => memory[slug] ?? cloneDefaultPage(slug));
}

export async function getPageContent(slug: SiteSlug): Promise<PageContent> {
  const pages = await getAllPageContent();
  return pages.find((page) => page.slug === slug) ?? cloneDefaultPage(slug);
}

export async function savePageContent(page: PageContent): Promise<PageContent> {
  const normalized: PageContent = {
    ...defaultPages[page.slug],
    navLabel: page.navLabel.trim().slice(0, 40),
    kicker: page.kicker.trim().slice(0, 80),
    title: page.title.trim().slice(0, 100),
    lead: page.lead.trim().slice(0, 320),
    sections: page.sections.slice(0, 12).map((section, index) => ({
      id: section.id.trim().replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `section-${index + 1}`,
      title: section.title.trim().slice(0, 120),
      body: section.body.trim().slice(0, 4000),
    })),
  };

  const database = getDatabase();
  if (database) {
    try {
      await database.prepare(
        `INSERT INTO site_content (slug, nav_label, kicker, title, lead, sections_json, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           nav_label = excluded.nav_label,
           kicker = excluded.kicker,
           title = excluded.title,
           lead = excluded.lead,
           sections_json = excluded.sections_json,
           updated_at = excluded.updated_at`,
      ).bind(
        normalized.slug,
        normalized.navLabel,
        normalized.kicker,
        normalized.title,
        normalized.lead,
        JSON.stringify(normalized.sections),
        new Date().toISOString(),
      ).run();
      return normalized;
    } catch {
      // The memory fallback keeps the local preview functional.
    }
  }

  memoryStore().content[normalized.slug] = normalized;
  return normalized;
}

export type NewApplication = Omit<ApplicationRecord, 'id' | 'createdAt' | 'status' | 'managerNote'>;

export async function createApplication(input: NewApplication): Promise<ApplicationRecord> {
  const record: ApplicationRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
    managerNote: '',
  };

  const database = getDatabase();
  if (database) {
    try {
      await database.prepare(
        `INSERT INTO applications
          (id, created_at, full_name, birth_date, citizenship, phone, service, location, applicant_note, status, manager_note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        record.id,
        record.createdAt,
        record.fullName,
        record.birthDate,
        record.citizenship,
        record.phone,
        record.service,
        record.location,
        record.applicantNote,
        record.status,
        record.managerNote,
      ).run();
      return record;
    } catch {
      // The memory fallback keeps the local preview functional.
    }
  }

  memoryStore().applications.unshift(record);
  return record;
}

type ApplicationRow = {
  id: string;
  created_at: string;
  full_name: string;
  birth_date: string;
  citizenship: string;
  phone: string;
  service: string;
  location: string;
  applicant_note: string;
  status: ApplicationStatus;
  manager_note: string;
};

function rowToApplication(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    fullName: row.full_name,
    birthDate: row.birth_date,
    citizenship: row.citizenship,
    phone: row.phone,
    service: row.service,
    location: row.location,
    applicantNote: row.applicant_note,
    status: applicationStatuses.includes(row.status) ? row.status : 'new',
    managerNote: row.manager_note,
  };
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  const database = getDatabase();
  if (database) {
    try {
      const response = await database.prepare(
        `SELECT id, created_at, full_name, birth_date, citizenship, phone, service,
                location, applicant_note, status, manager_note
         FROM applications ORDER BY created_at DESC`,
      ).all<ApplicationRow>();
      return (response.results ?? []).map(rowToApplication);
    } catch {
      // The memory fallback keeps the local preview functional.
    }
  }
  return memoryStore().applications;
}

export async function updateApplication(
  id: string,
  status: ApplicationStatus,
  managerNote: string,
): Promise<ApplicationRecord | null> {
  const database = getDatabase();
  if (database) {
    try {
      await database.prepare(
        'UPDATE applications SET status = ?, manager_note = ? WHERE id = ?',
      ).bind(status, managerNote.slice(0, 4000), id).run();
      const row = await database.prepare(
        `SELECT id, created_at, full_name, birth_date, citizenship, phone, service,
                location, applicant_note, status, manager_note
         FROM applications WHERE id = ?`,
      ).bind(id).first<ApplicationRow>();
      return row ? rowToApplication(row) : null;
    } catch {
      // The memory fallback keeps the local preview functional.
    }
  }

  const record = memoryStore().applications.find((application) => application.id === id);
  if (!record) return null;
  record.status = status;
  record.managerNote = managerNote.slice(0, 4000);
  return record;
}
