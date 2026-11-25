import { analyticsDb, json, analyticsCors, analyticsOriginAllowed, analyticsPreflight } from '../../../../lib/analytics-server';
import { validateEvent } from '../../../../lib/analytics-validation';
import { env } from 'cloudflare:workers';
import { verifyVisit } from '../../../../lib/analytics-capability';
export const OPTIONS=analyticsPreflight;
export async function POST(request:Request){return analyticsCors(request,await ingest(request));}
async function ingest(request:Request){
  if(!analyticsOriginAllowed(request) || !request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Authorized-origin JSON requests only.'},403);
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing event.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return json({error:'Event too large.'},413);}chunks.push(value);}
  let input:unknown;try{input=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(chunk=>Array.from(chunk)))));}catch{return json({error:'Invalid JSON.'},400);}
  const event=validateEvent(input);if(!event)return json({error:'Invalid event.'},400);
  if(!await verifyVisit(request.headers.get('X-AltWing-Visit'),event.sessionId,env.ANALYTICS_INGEST_SECRET))return json({error:'Invalid visit authorization.'},403);
  if(request.headers.get('DNT')==='1'||request.headers.get('Sec-GPC')==='1')return json({accepted:true,recorded:false},202);
  try{
    const db=analyticsDb(),now=Math.floor(Date.now()/1000),p=event.properties;
    // D1 serializes writes. Keep the semantic guard inside this INSERT so
    // racing/reloaded clients cannot both record a field exploration. Existing
    // historical duplicates remain untouched; no historical UNIQUE index is needed.
    const inserted=await db.prepare(`INSERT OR IGNORE INTO analytics_events (id,session_id,event,created_at,page,from_page,to_page,placement,project,major,wing,seconds,origin)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM analytics_events WHERE session_id=? AND created_at>=?)<60 AND (SELECT COUNT(*) FROM analytics_events WHERE session_id=? AND created_at>=?)<500
      AND (? <> 'Recommended Field Explored' OR NOT EXISTS (SELECT 1 FROM analytics_events WHERE session_id=? AND major=? AND event='Recommended Field Explored'))`)
      .bind(event.id,event.sessionId,event.event,now,p.page,p.from_page??null,p.to_page??null,p.placement??null,p.project??null,p.major??null,p.wing??null,p.previous_page_seconds??null,request.headers.get('Origin'),event.sessionId,now-60,event.sessionId,now-86400,event.event,event.sessionId,p.major??null).run();
    if(event.id.startsWith('0')){
      const history=await db.prepare('SELECT backfill_done FROM impact_meta WHERE id=1').all<{backfill_done:number}>();
      if(!history.results.length||history.results[0].backfill_done===1)await db.prepare('DELETE FROM analytics_events WHERE created_at < ?').bind(now-90*86400).run();
    }
    return json({accepted:true,recorded:inserted.meta.changes>0},202);
  }catch{return json({error:'Analytics is temporarily unavailable.'},503);}
}
