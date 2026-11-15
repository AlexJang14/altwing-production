export async function cleanImpactRetention(db:D1Database,now=Math.floor(Date.now()/1000)){
  const status=await db.prepare('SELECT backfill_done FROM impact_meta WHERE id=1').all<{backfill_done:number}>();
  if(status.results[0]?.backfill_done!==1)return;
  await db.batch([
    db.prepare('DELETE FROM impact_sessions WHERE last_seen<?').bind(now-90*86400),
    db.prepare('DELETE FROM impact_activity WHERE MAX(COALESCE(started_at,0),COALESCE(completed_at,0))<?').bind(now-90*86400),
    db.prepare('UPDATE impact_surveys SET session_id=NULL WHERE session_id IS NOT NULL AND created_at<?').bind(now-90*86400),
    db.prepare('UPDATE impact_surveys SET testimonial=NULL,quote_permission=0 WHERE testimonial IS NOT NULL AND created_at<?').bind(now-365*86400),
  ]);
}
