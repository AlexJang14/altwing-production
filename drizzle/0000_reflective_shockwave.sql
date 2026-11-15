CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`event` text NOT NULL,
	`created_at` integer NOT NULL,
	`page` text NOT NULL,
	`from_page` text,
	`to_page` text,
	`placement` text,
	`project` text,
	`major` text,
	`wing` text,
	`seconds` integer
);
--> statement-breakpoint
CREATE INDEX `analytics_created_idx` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_session_created_idx` ON `analytics_events` (`session_id`,`created_at`);