CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`full_name` text NOT NULL,
	`birth_date` text NOT NULL,
	`citizenship` text NOT NULL,
	`phone` text NOT NULL,
	`service` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`applicant_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`manager_note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_applications_created_at` ON `applications` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_status` ON `applications` (`status`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`slug` text PRIMARY KEY NOT NULL,
	`nav_label` text NOT NULL,
	`kicker` text NOT NULL,
	`title` text NOT NULL,
	`lead` text NOT NULL,
	`sections_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
