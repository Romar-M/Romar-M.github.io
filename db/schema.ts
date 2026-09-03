import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(),
    createdAt: text('created_at').notNull(),
    fullName: text('full_name').notNull(),
    birthDate: text('birth_date').notNull(),
    citizenship: text('citizenship').notNull(),
    phone: text('phone').notNull(),
    service: text('service').notNull(),
    location: text('location').notNull().default(''),
    applicantNote: text('applicant_note').notNull().default(''),
    status: text('status').notNull().default('new'),
    managerNote: text('manager_note').notNull().default(''),
  },
  (table) => [
    index('idx_applications_created_at').on(table.createdAt),
    index('idx_applications_status').on(table.status),
  ],
);

export const siteContent = sqliteTable('site_content', {
  slug: text('slug').primaryKey(),
  navLabel: text('nav_label').notNull(),
  kicker: text('kicker').notNull(),
  title: text('title').notNull(),
  lead: text('lead').notNull(),
  sectionsJson: text('sections_json').notNull(),
  updatedAt: text('updated_at').notNull(),
});
