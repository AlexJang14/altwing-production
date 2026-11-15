import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const analyticsEvents=sqliteTable('analytics_events',{
  id:text('id').primaryKey(),sessionId:text('session_id').notNull(),event:text('event').notNull(),createdAt:integer('created_at').notNull(),
  page:text('page').notNull(),fromPage:text('from_page'),toPage:text('to_page'),placement:text('placement'),project:text('project'),major:text('major'),wing:text('wing'),seconds:integer('seconds'),
},table=>[index('analytics_created_idx').on(table.createdAt),index('analytics_session_created_idx').on(table.sessionId,table.createdAt)]);
