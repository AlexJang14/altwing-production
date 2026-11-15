import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
export async function POST(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:'Owner sign-in is required.'},access);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Same-origin owner requests only.'},403);
  try{
    const db=analyticsDb(),now=Math.floor(Date.now()/1000);
    // These are bounded data operations after the schema-only migration. D1
    // batch transactions serialize the cursor/ready transition with event writes.
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO impact_totals(id) VALUES(1)'),
      db.prepare(`INSERT OR IGNORE INTO impact_meta(id,activated_at,earliest_available,backfill_done,backfill_cursor) VALUES(1,?,COALESCE((SELECT MIN(created_at) FROM analytics_events WHERE origin IS NULL OR origin IN ('https://altwing.org','https://www.altwing.org')),?),0,0)`).bind(now,now),
      db.prepare(`INSERT OR IGNORE INTO impact_replay(id,session_id,event,created_at,page,project,wing)
        SELECT id,session_id,event,created_at,page,project,wing FROM (SELECT * FROM analytics_events WHERE rowid>(SELECT backfill_cursor FROM impact_meta WHERE id=1) AND (SELECT backfill_done FROM impact_meta WHERE id=1)=0 ORDER BY rowid LIMIT 500)
        WHERE origin IS NULL OR origin IN ('https://altwing.org','https://www.altwing.org')`),
      db.prepare('UPDATE impact_meta SET backfill_cursor=COALESCE((SELECT MAX(rowid) FROM (SELECT rowid FROM analytics_events WHERE rowid>backfill_cursor ORDER BY rowid LIMIT 500)),backfill_cursor) WHERE id=1 AND backfill_done=0'),
      db.prepare('UPDATE impact_meta SET backfill_done=1 WHERE id=1 AND NOT EXISTS(SELECT 1 FROM analytics_events WHERE rowid>backfill_cursor)'),
    ]);
    const status=await db.prepare('SELECT backfill_done AS ready,backfill_cursor AS examinedThrough FROM impact_meta WHERE id=1').all();
    return json(status.results[0]);
  }catch{return json({error:'Historical reporting could not be prepared. Confirm the schema migration is applied, then retry; the cursor is resumable.'},503);}
}
