import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
import {impactRange} from '../../../../lib/impact-validation';
import {cleanImpactRetention} from '../../../../lib/impact-retention';
export const dynamic='force-dynamic';
const columns='sessions,page_views,mission_starts,mission_completions,wingmatch_starts,wingmatch_completions,wingmatch_conversions';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:access===401?'Sign in to view impact reports.':'Owner access required.'},access);
  const range=impactRange(new URL(request.url).searchParams);if(!range)return json({error:'Choose valid UTC dates with a start before the end, up to today.'},400);
  try{
    const db=analyticsDb(),metrics=columns.split(',');
    await cleanImpactRetention(db);
    const results=await db.batch([
      db.prepare(`SELECT ${metrics.map(c=>`COALESCE(SUM(${c}),0) AS ${c}`).join(',')} FROM impact_daily WHERE day BETWEEN ? AND ?`).bind(range.from,range.to),
      db.prepare(`SELECT ${columns} FROM impact_totals WHERE id=1`),
      db.prepare(`SELECT day,${columns} FROM impact_daily WHERE day BETWEEN ? AND ? ORDER BY day`).bind(range.from,range.to),
      db.prepare(`SELECT COUNT(*) AS responses,COUNT(*) AS respondentSessions,COALESCE(SUM(CASE WHEN understanding_before IS NOT NULL AND understanding_after IS NOT NULL THEN 1 ELSE 0 END),0) AS paired,AVG(satisfaction) AS satisfaction,AVG(helpfulness) AS helpfulness,AVG(recommendation) AS recommendation,AVG(CASE WHEN understanding_after IS NOT NULL THEN understanding_before END) AS before,AVG(CASE WHEN understanding_before IS NOT NULL THEN understanding_after END) AS after,AVG(understanding_after-understanding_before) AS change,COALESCE(SUM(CASE WHEN source='legacy-wingmatch' THEN 1 ELSE 0 END),0) AS legacyResponses,AVG(legacy_understanding) AS legacyUnderstanding,AVG(legacy_direction) AS legacyDirection,AVG(legacy_action) AS legacyAction FROM impact_surveys WHERE created_at>=? AND created_at<?`).bind(range.start,range.end),
      db.prepare(`SELECT id,source,created_at,testimonial AS text,quote_permission AS quotePermission FROM impact_surveys WHERE created_at>=? AND created_at<? AND testimonial IS NOT NULL ORDER BY created_at DESC LIMIT 100`).bind(range.start,range.end),
      db.prepare(`SELECT activated_at,earliest_available,backfill_done FROM impact_meta WHERE id=1`),
      ...['satisfaction','helpfulness','recommendation','understanding_after'].map(metric=>db.prepare(`SELECT '${metric}' AS metric,${metric} AS rating,COUNT(*) AS responses FROM impact_surveys WHERE created_at>=? AND created_at<? AND ${metric} IS NOT NULL GROUP BY ${metric} ORDER BY ${metric}`).bind(range.start,range.end)),
    ]);
    const coverage=results[5].results[0] as {activated_at:number;earliest_available:number;backfill_done:number}|undefined;if(!coverage||!coverage.backfill_done||!results[1].results[0])return json({error:'Prepare historical reporting before showing impact totals. Existing raw navigation reports remain available.',needsInitialization:true},503);
    return json({generatedAt:new Date().toISOString(),range:{from:range.from,to:range.to,allTime:range.allTime},coverage:{activatedAt:new Date(Number(coverage.activated_at)*1000).toISOString(),earliestAvailable:new Date(Number(coverage.earliest_available)*1000).toISOString(),note:'Available legacy page views and WingMatch events were backfilled from retained records. Earlier deleted events cannot be reconstructed. Mission metrics and surveys start at activation.'},totals:results[0].results[0],lifetime:results[1].results[0],daily:results[2].results,surveys:results[3].results[0],distributions:results.slice(6).flatMap(result=>result.results),feedback:results[4].results.map((item:{id:string;source:string;text:string;quotePermission:number;created_at:number})=>({id:item.id,source:item.source,text:item.text,quotePermission:Boolean(item.quotePermission),createdAt:new Date(Number(item.created_at)*1000).toISOString()})),caveats:[
      'Sessions are anonymous tab visits separated by 30 minutes of inactivity, not unique individuals. Sessions are counted on their first observed UTC day.',
      'Surveys are optional, one per anonymous visit session. Respondent sessions are not all visitors or verified unique students; response totals may include people who disabled automatic usage tracking.',
      'WingMatch conversion counts visit sessions started in the selected range that later completed, as observed through report generation. Completions are attributed to the start date for the rate; raw completions are counted on their occurrence date. This is not a longitudinal student success measure.',
      'Understanding changes use only paired self-reports on the same survey. They do not establish objective learning gains or causation.',
      'Opt-outs, blocked scripts, abandoned forms and offline visits are not fully observed. These counts are not audited or bot-proof.',
      'Cloudflare performance/site metrics are separate from these first-party educational metrics. Hash-route navigation is measured by AltWing.',
      'Anonymous testimonials may still contain identifying details; manually review any permitted quote before sharing. Unpermitted text is excluded from printable/public impact reports.',
    ]});
  }catch{return json({error:'Impact reports are unavailable. Confirm the additive database migration is applied.'},503);}
}
