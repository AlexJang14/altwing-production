import { analyticsAuthorization, analyticsDb, json } from '../../../../lib/analytics-server';
import { reportDays } from '../../../../lib/analytics-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:access===401?'Sign in to view analytics.':'This dashboard is available to the site owner only.'},access);
  try{
    const days=reportDays(new URL(request.url).searchParams.get('days')),now=Math.floor(Date.now()/1000),since=days===1?Math.floor(now/86400)*86400:Math.floor(now/86400)*86400-(days-1)*86400,db=analyticsDb();
    const results=await db.batch([
      db.prepare(`SELECT COUNT(*) AS events, COUNT(DISTINCT session_id) AS sessions, SUM(CASE WHEN event='Page Viewed' THEN 1 ELSE 0 END) AS page_views, SUM(CASE WHEN event='Navigation Clicked' THEN 1 ELSE 0 END) AS navigation_clicks FROM analytics_events WHERE created_at>=?`).bind(since),
      db.prepare(`SELECT strftime('%Y-%m-%d',created_at,'unixepoch') AS day,COUNT(DISTINCT session_id) AS sessions,SUM(CASE WHEN event='Page Viewed' THEN 1 ELSE 0 END) AS views FROM analytics_events WHERE created_at>=? GROUP BY day ORDER BY day`).bind(since),
      db.prepare(`SELECT page,COUNT(*) AS views,COUNT(DISTINCT session_id) AS sessions FROM analytics_events WHERE created_at>=? AND event='Page Viewed' GROUP BY page ORDER BY views DESC LIMIT 20`).bind(since),
      db.prepare(`SELECT from_page AS source,page AS target,COUNT(*) AS count FROM analytics_events WHERE created_at>=? AND event='Page Viewed' AND from_page IS NOT NULL GROUP BY source,target ORDER BY count DESC LIMIT 20`).bind(since),
      db.prepare(`SELECT event,COUNT(DISTINCT session_id) AS sessions,COUNT(*) AS count FROM analytics_events WHERE created_at>=? AND event IN ('WingMatch Started','WingMatch Completed','Project Test Run','Project Completed') GROUP BY event`).bind(since),
      db.prepare(`SELECT placement,COUNT(*) AS clicks FROM analytics_events WHERE created_at>=? AND event='Navigation Clicked' GROUP BY placement ORDER BY clicks DESC`).bind(since),
      db.prepare(`WITH ranked AS (SELECT page,created_at,ROW_NUMBER() OVER(PARTITION BY session_id ORDER BY created_at DESC,rowid DESC) AS position FROM analytics_events WHERE created_at>=? AND event='Page Viewed') SELECT page,COUNT(*) AS sessions FROM ranked WHERE position=1 AND created_at<? GROUP BY page ORDER BY sessions DESC LIMIT 10`).bind(since,now-1800),
      db.prepare(`SELECT COUNT(*) AS completed_started_sessions FROM (SELECT session_id FROM analytics_events WHERE created_at>=? GROUP BY session_id HAVING MIN(CASE WHEN event='WingMatch Started' THEN created_at END) IS NOT NULL AND MAX(CASE WHEN event='WingMatch Completed' THEN created_at END)>=MIN(CASE WHEN event='WingMatch Started' THEN created_at END))`).bind(since),
    ]);
    return json({days,since,updatedAt:new Date().toISOString(),totals:results[0].results[0],daily:results[1].results,pages:results[2].results,paths:results[3].results,milestones:results[4].results,placements:results[5].results,lastPages:results[6].results,matchConversions:results[7].results[0]});
  }catch{return json({error:'Could not load analytics. Please try again.'},503);}
}
