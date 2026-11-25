CREATE TABLE `impact_assessment_activity` (
	`key` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`kind` text NOT NULL,
	`activity` text NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`assessment_id`) REFERENCES `impact_assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `impact_assessment_activity_parent` ON `impact_assessment_activity` (`assessment_id`);--> statement-breakpoint
CREATE TABLE `impact_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`version` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	`offered_at` integer,
	`started_at` integer,
	`dismissed_at` integer,
	`submitted_at` integer,
	`opportunity` text,
	`reasoning` text,
	`discovery` text,
	`motivation` text,
	`readiness` text,
	`story` text,
	`quote_permission` integer DEFAULT 0 NOT NULL,
	`feedback_permission` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `impact_assessment_visit_version_source` ON `impact_assessments` (`session_id`,`version`,`source`);--> statement-breakpoint
CREATE INDEX `impact_assessment_submitted` ON `impact_assessments` (`submitted_at`);--> statement-breakpoint
CREATE INDEX `impact_assessment_offered` ON `impact_assessments` (`offered_at`);--> statement-breakpoint
CREATE TABLE `impact_behavior_activity` (
	`key` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`activity` text NOT NULL,
	`last_seen` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `impact_behavior_last_seen` ON `impact_behavior_activity` (`last_seen`);--> statement-breakpoint
CREATE TABLE `impact_behavior_daily` (
	`day` text PRIMARY KEY NOT NULL,
	`field_explorations` integer DEFAULT 0 NOT NULL,
	`project_starts` integer DEFAULT 0 NOT NULL,
	`project_completions` integer DEFAULT 0 NOT NULL,
	`project_conversions` integer DEFAULT 0 NOT NULL,
	`lab_starts` integer DEFAULT 0 NOT NULL,
	`proofs_saved` integer DEFAULT 0 NOT NULL,
	`lab_conversions` integer DEFAULT 0 NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER impact_behavior_insert AFTER INSERT ON impact_behavior_activity BEGIN
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='field' AND NEW.completed_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET field_explorations=field_explorations+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='field' AND NEW.completed_at IS NOT NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='project' AND NEW.started_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_starts=project_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='project' AND NEW.started_at IS NOT NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='project' AND NEW.completed_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_completions=project_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='project' AND NEW.completed_at IS NOT NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='project' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_conversions=project_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='project' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.started_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET lab_starts=lab_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='lab' AND NEW.started_at IS NOT NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.completed_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET proofs_saved=proofs_saved+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='lab' AND NEW.completed_at IS NOT NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET lab_conversions=lab_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='lab' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at;
END;
--> statement-breakpoint
CREATE TRIGGER impact_behavior_update AFTER UPDATE ON impact_behavior_activity BEGIN
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='field' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET field_explorations=field_explorations+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='field' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='project' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_starts=project_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='project' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='project' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_completions=project_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='project' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='project' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at) ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET project_conversions=project_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='project' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at);
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET lab_starts=lab_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='lab' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET proofs_saved=proofs_saved+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.kind='lab' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 INSERT INTO impact_behavior_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.kind='lab' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at) ON CONFLICT(day) DO NOTHING;
 UPDATE impact_behavior_daily SET lab_conversions=lab_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.kind='lab' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at);
END;
--> statement-breakpoint
CREATE TRIGGER impact_behavior_capture AFTER INSERT ON analytics_events
WHEN NEW.origin IN ('https://altwing.org','https://www.altwing.org') AND (NEW.event IN ('Mission Started','Mission Completed') OR NEW.event='Recommended Field Explored') BEGIN
 INSERT INTO impact_behavior_activity(key,session_id,kind,activity,last_seen,started_at,completed_at)
 VALUES(NEW.session_id||':'||CASE WHEN NEW.event='Recommended Field Explored' THEN 'field:'||NEW.major WHEN NEW.page='projects' THEN 'project:'||NEW.project ELSE 'lab:'||NEW.wing END,NEW.session_id,CASE WHEN NEW.event='Recommended Field Explored' THEN 'field' WHEN NEW.page='projects' THEN 'project' ELSE 'lab' END,CASE WHEN NEW.event='Recommended Field Explored' THEN NEW.major WHEN NEW.page='projects' THEN NEW.project ELSE NEW.wing END,NEW.created_at,CASE WHEN NEW.event='Mission Started' THEN NEW.created_at END,CASE WHEN NEW.event IN ('Mission Completed','Recommended Field Explored') THEN NEW.created_at END)
 ON CONFLICT(key) DO UPDATE SET last_seen=MAX(last_seen,excluded.last_seen),started_at=COALESCE(impact_behavior_activity.started_at,excluded.started_at),completed_at=COALESCE(impact_behavior_activity.completed_at,excluded.completed_at);
END;
