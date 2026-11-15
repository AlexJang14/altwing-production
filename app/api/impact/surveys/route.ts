import {env} from 'cloudflare:workers';
import {analyticsDb,analyticsOriginAllowed,analyticsCors,analyticsPreflight,json} from '../../../../lib/analytics-server';
import {verifyVisit} from '../../../../lib/analytics-capability';
import {validateImpact} from '../../../../lib/impact-validation';
import {cleanImpactRetention} from '../../../../lib/impact-retention';
const canonicalOrigin=(request:Request)=>['https://altwing.org','https://www.altwing.org'].includes(request.headers.get('Origin')??'');
export const OPTIONS=(request:Request)=>canonicalOrigin(request)?analyticsPreflight(request):json({error:'Feedback is enabled on the production website only.'},403);
export async function POST(request:Request){return analyticsCors(request,await submit(request));}
async function submit(request:Request){
  if(!canonicalOrigin(request)||!analyticsOriginAllowed(request)||!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Production-origin JSON requests only.'},403);
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing feedback.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();return json({error:'Feedback is too large.'},413);}chunks.push(value);}
  let input:unknown;try{input=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(c=>Array.from(c)))));}catch{return json({error:'Invalid JSON.'},400);}
  const data=validateImpact(input);if(!data)return json({error:'Check the ratings and permissions. Do not include names, contact details or links in a testimonial.'},400);
  if(!await verifyVisit(request.headers.get('X-AltWing-Visit'),data.session_id,env.ANALYTICS_INGEST_SECRET))return json({error:'Visit authorization expired. Please retry.'},403);
  try{
    const db=analyticsDb(),now=Math.floor(Date.now()/1000);
    await cleanImpactRetention(db,now);
    // One voluntary response per anonymous tab-session. Retries preserve the same ID.
    const result=await db.prepare(`INSERT OR IGNORE INTO impact_surveys(id,session_id,version,source,created_at,satisfaction,helpfulness,recommendation,understanding_before,understanding_after,legacy_understanding,legacy_direction,legacy_action,testimonial,quote_permission,feedback_permission)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`).bind(data.id,data.session_id,data.version,data.source,now,data.satisfaction??null,data.helpfulness??null,data.recommendation??null,data.understanding_before??null,data.understanding_after??null,data.legacy_understanding??null,data.legacy_direction??null,data.legacy_action??null,data.testimonial||null,data.quote_permission?1:0).run();
    if(result.meta.changes===0){
      const existing=await db.prepare('SELECT source,satisfaction,helpfulness,recommendation,understanding_before,understanding_after,legacy_understanding,legacy_direction,legacy_action,testimonial,quote_permission FROM impact_surveys WHERE id=? AND session_id=?').bind(data.id,data.session_id).all<Record<string,unknown>>();
      if(!existing.results.length)return json({error:'Feedback was already received for this visit. Thank you.'},409);
      const expected={source:data.source,satisfaction:data.satisfaction??null,helpfulness:data.helpfulness??null,recommendation:data.recommendation??null,understanding_before:data.understanding_before??null,understanding_after:data.understanding_after??null,legacy_understanding:data.legacy_understanding??null,legacy_direction:data.legacy_direction??null,legacy_action:data.legacy_action??null,testimonial:data.testimonial||null,quote_permission:data.quote_permission?1:0};
      if(Object.entries(expected).some(([key,value])=>existing.results[0][key]!==value))return json({error:'An earlier version of this response was already saved. This retry did not change its ratings or quote permission.'},409);
    }
    return json({accepted:true,recorded:result.meta.changes>0},202);
  }catch{return json({error:'Feedback could not be saved. Your response has not been submitted. Please retry.'},503);}
}
