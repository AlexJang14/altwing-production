CREATE TABLE `impact_activity` (
	`key` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`activity` text NOT NULL,
	`started_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `impact_daily` (
	`day` text PRIMARY KEY NOT NULL,
	`sessions` integer DEFAULT 0 NOT NULL,
	`page_views` integer DEFAULT 0 NOT NULL,
	`mission_starts` integer DEFAULT 0 NOT NULL,
	`mission_completions` integer DEFAULT 0 NOT NULL,
	`wingmatch_starts` integer DEFAULT 0 NOT NULL,
	`wingmatch_completions` integer DEFAULT 0 NOT NULL,
	`wingmatch_conversions` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `impact_meta` (
	`id` integer PRIMARY KEY NOT NULL,
	`activated_at` integer NOT NULL,
	`earliest_available` integer NOT NULL,
	`backfill_done` integer DEFAULT 0 NOT NULL,
	`backfill_cursor` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `impact_replay` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`event` text NOT NULL,
	`created_at` integer NOT NULL,
	`page` text NOT NULL,
	`project` text,
	`wing` text
);
--> statement-breakpoint
CREATE TABLE `impact_sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`first_seen` integer NOT NULL,
	`last_seen` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `impact_surveys` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`version` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	`satisfaction` integer,
	`helpfulness` integer,
	`recommendation` integer,
	`understanding_before` integer,
	`understanding_after` integer,
	`legacy_understanding` integer,
	`legacy_direction` integer,
	`legacy_action` integer,
	`testimonial` text,
	`quote_permission` integer DEFAULT 0 NOT NULL,
	`feedback_permission` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `impact_surveys_session_id_unique` ON `impact_surveys` (`session_id`);--> statement-breakpoint
CREATE INDEX `impact_survey_date_idx` ON `impact_surveys` (`created_at`);--> statement-breakpoint
CREATE TABLE `impact_totals` (
	`id` integer PRIMARY KEY NOT NULL,
	`sessions` integer DEFAULT 0 NOT NULL,
	`page_views` integer DEFAULT 0 NOT NULL,
	`mission_starts` integer DEFAULT 0 NOT NULL,
	`mission_completions` integer DEFAULT 0 NOT NULL,
	`wingmatch_starts` integer DEFAULT 0 NOT NULL,
	`wingmatch_completions` integer DEFAULT 0 NOT NULL,
	`wingmatch_conversions` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `analytics_events` ADD `origin` text;
--> statement-breakpoint
CREATE TRIGGER impact_new_session AFTER INSERT ON impact_sessions BEGIN
 INSERT INTO impact_daily(day) VALUES(strftime('%Y-%m-%d',NEW.first_seen,'unixepoch')) ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET sessions=sessions+1 WHERE id=1;
 UPDATE impact_daily SET sessions=sessions+1 WHERE day=strftime('%Y-%m-%d',NEW.first_seen,'unixepoch');
END;
--> statement-breakpoint
CREATE TRIGGER impact_activity_insert AFTER INSERT ON impact_activity BEGIN
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET wingmatch_starts=wingmatch_starts+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL;
 UPDATE impact_daily SET wingmatch_starts=wingmatch_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET wingmatch_completions=wingmatch_completions+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL;
 UPDATE impact_daily SET wingmatch_completions=wingmatch_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET mission_starts=mission_starts+1 WHERE id=1 AND NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL;
 UPDATE impact_daily SET mission_starts=mission_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET mission_completions=mission_completions+1 WHERE id=1 AND NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL;
 UPDATE impact_daily SET mission_completions=mission_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL;
 UPDATE impact_totals SET wingmatch_conversions=wingmatch_conversions+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at;
 UPDATE impact_daily SET wingmatch_conversions=wingmatch_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at;
END;
--> statement-breakpoint
CREATE TRIGGER impact_activity_update AFTER UPDATE ON impact_activity BEGIN
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET wingmatch_starts=wingmatch_starts+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 UPDATE impact_daily SET wingmatch_starts=wingmatch_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET wingmatch_completions=wingmatch_completions+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 UPDATE impact_daily SET wingmatch_completions=wingmatch_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.started_at,'unixepoch') WHERE NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET mission_starts=mission_starts+1 WHERE id=1 AND NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 UPDATE impact_daily SET mission_starts=mission_starts+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity<>'wingmatch' AND NEW.started_at IS NOT NULL AND OLD.started_at IS NULL;
 INSERT INTO impact_daily(day) SELECT strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') WHERE NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET mission_completions=mission_completions+1 WHERE id=1 AND NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 UPDATE impact_daily SET mission_completions=mission_completions+1 WHERE day=strftime('%Y-%m-%d',NEW.completed_at,'unixepoch') AND NEW.activity<>'wingmatch' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL;
 UPDATE impact_totals SET wingmatch_conversions=wingmatch_conversions+1 WHERE id=1 AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at);
 UPDATE impact_daily SET wingmatch_conversions=wingmatch_conversions+1 WHERE day=strftime('%Y-%m-%d',NEW.started_at,'unixepoch') AND NEW.activity='wingmatch' AND NEW.started_at IS NOT NULL AND NEW.completed_at>=NEW.started_at AND (OLD.started_at IS NULL OR OLD.completed_at IS NULL OR OLD.completed_at<OLD.started_at);
END;
--> statement-breakpoint
CREATE TRIGGER impact_record_event AFTER INSERT ON impact_replay BEGIN
 INSERT INTO impact_sessions(session_id,first_seen,last_seen) VALUES(NEW.session_id,NEW.created_at,NEW.created_at) ON CONFLICT(session_id) DO UPDATE SET last_seen=MAX(last_seen,excluded.last_seen);
 INSERT INTO impact_daily(day) VALUES(strftime('%Y-%m-%d',NEW.created_at,'unixepoch')) ON CONFLICT(day) DO NOTHING;
 UPDATE impact_totals SET page_views=page_views+1 WHERE id=1 AND NEW.event='Page Viewed';
 UPDATE impact_daily SET page_views=page_views+1 WHERE day=strftime('%Y-%m-%d',NEW.created_at,'unixepoch') AND NEW.event='Page Viewed';
 INSERT INTO impact_activity(key,session_id,activity,started_at,completed_at)
 SELECT NEW.session_id||':'||CASE WHEN NEW.event IN ('WingMatch Started','WingMatch Completed') THEN 'wingmatch' WHEN NEW.page='projects' THEN 'project:'||NEW.project ELSE 'lab:'||NEW.wing END,NEW.session_id,CASE WHEN NEW.event IN ('WingMatch Started','WingMatch Completed') THEN 'wingmatch' WHEN NEW.page='projects' THEN 'project:'||NEW.project ELSE 'lab:'||NEW.wing END,CASE WHEN NEW.event IN ('WingMatch Started','Mission Started') THEN NEW.created_at END,CASE WHEN NEW.event IN ('WingMatch Completed','Mission Completed') THEN NEW.created_at END WHERE NEW.event IN ('WingMatch Started','WingMatch Completed','Mission Started','Mission Completed')
 ON CONFLICT(key) DO UPDATE SET started_at=COALESCE(impact_activity.started_at,excluded.started_at),completed_at=CASE WHEN impact_activity.completed_at IS NULL THEN excluded.completed_at WHEN excluded.completed_at IS NULL THEN impact_activity.completed_at ELSE MAX(impact_activity.completed_at,excluded.completed_at) END;
END;
--> statement-breakpoint
CREATE TRIGGER impact_cleanup AFTER DELETE ON analytics_events WHEN OLD.created_at<unixepoch()-90*86400 AND (SELECT backfill_done FROM impact_meta WHERE id=1)=1 BEGIN
 DELETE FROM impact_replay WHERE created_at<unixepoch()-90*86400;
 DELETE FROM impact_sessions WHERE last_seen<unixepoch()-90*86400;
 DELETE FROM impact_activity WHERE MAX(COALESCE(started_at,0),COALESCE(completed_at,0))<unixepoch()-90*86400;
 UPDATE impact_surveys SET session_id=NULL WHERE session_id IS NOT NULL AND created_at<unixepoch()-90*86400;
 UPDATE impact_surveys SET testimonial=NULL,quote_permission=0 WHERE testimonial IS NOT NULL AND created_at<unixepoch()-365*86400;
END;
--> statement-breakpoint
CREATE UNIQUE INDEX analytics_mission_once ON analytics_events(session_id,event,COALESCE(project,''),COALESCE(wing,'')) WHERE event IN ('Mission Started','Mission Completed');
--> statement-breakpoint
CREATE TRIGGER impact_capture_event AFTER INSERT ON analytics_events WHEN NEW.origin IN ('https://altwing.org','https://www.altwing.org') AND (SELECT backfill_done FROM impact_meta WHERE id=1)=1 BEGIN
 INSERT OR IGNORE INTO impact_replay(id,session_id,event,created_at,page,project,wing) VALUES(NEW.id,NEW.session_id,NEW.event,NEW.created_at,NEW.page,NEW.project,NEW.wing);
END;
