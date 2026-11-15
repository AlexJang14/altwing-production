import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const analyticsEvents=sqliteTable('analytics_events',{
  id:text('id').primaryKey(),sessionId:text('session_id').notNull(),event:text('event').notNull(),createdAt:integer('created_at').notNull(),
  page:text('page').notNull(),fromPage:text('from_page'),toPage:text('to_page'),placement:text('placement'),project:text('project'),major:text('major'),wing:text('wing'),seconds:integer('seconds'),origin:text('origin'),
},table=>[index('analytics_created_idx').on(table.createdAt),index('analytics_session_created_idx').on(table.sessionId,table.createdAt)]);

const counters=()=>({sessions:integer('sessions').notNull().default(0),pageViews:integer('page_views').notNull().default(0),missionStarts:integer('mission_starts').notNull().default(0),missionCompletions:integer('mission_completions').notNull().default(0),wingmatchStarts:integer('wingmatch_starts').notNull().default(0),wingmatchCompletions:integer('wingmatch_completions').notNull().default(0),wingmatchConversions:integer('wingmatch_conversions').notNull().default(0)});
export const impactTotals=sqliteTable('impact_totals',{id:integer('id').primaryKey(),...counters()});
export const impactDaily=sqliteTable('impact_daily',{day:text('day').primaryKey(),...counters()});
export const impactMeta=sqliteTable('impact_meta',{id:integer('id').primaryKey(),activatedAt:integer('activated_at').notNull(),earliestAvailable:integer('earliest_available').notNull(),backfillDone:integer('backfill_done').notNull().default(0),backfillCursor:integer('backfill_cursor').notNull().default(0)});
export const impactSessions=sqliteTable('impact_sessions',{sessionId:text('session_id').primaryKey(),firstSeen:integer('first_seen').notNull(),lastSeen:integer('last_seen').notNull()});
export const impactActivity=sqliteTable('impact_activity',{key:text('key').primaryKey(),sessionId:text('session_id').notNull(),activity:text('activity').notNull(),startedAt:integer('started_at'),completedAt:integer('completed_at')});
export const impactReplay=sqliteTable('impact_replay',{id:text('id').primaryKey(),sessionId:text('session_id').notNull(),event:text('event').notNull(),createdAt:integer('created_at').notNull(),page:text('page').notNull(),project:text('project'),wing:text('wing')});
export const impactSurveys=sqliteTable('impact_surveys',{
  id:text('id').primaryKey(),sessionId:text('session_id').unique(),version:text('version').notNull(),source:text('source').notNull(),createdAt:integer('created_at').notNull(),
  satisfaction:integer('satisfaction'),helpfulness:integer('helpfulness'),recommendation:integer('recommendation'),understandingBefore:integer('understanding_before'),understandingAfter:integer('understanding_after'),
  legacyUnderstanding:integer('legacy_understanding'),legacyDirection:integer('legacy_direction'),legacyAction:integer('legacy_action'),testimonial:text('testimonial'),quotePermission:integer('quote_permission').notNull().default(0),feedbackPermission:integer('feedback_permission').notNull(),
},table=>[index('impact_survey_date_idx').on(table.createdAt)]);
