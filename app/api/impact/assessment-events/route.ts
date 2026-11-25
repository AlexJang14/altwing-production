import {analyticsCors,analyticsOriginAllowed,analyticsPreflight,json} from '../../../../lib/analytics-server';
import {recordAssessmentEvent} from '../../../../lib/assessment-server';
const canonical=(r:Request)=>['https://altwing.org','https://www.altwing.org'].includes(r.headers.get('Origin')??'');
export const OPTIONS=(r:Request)=>canonical(r)?analyticsPreflight(r):json({error:'Production origin required.'},403);
export async function POST(request:Request){
  if(!canonical(request)||!analyticsOriginAllowed(request)||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Production-origin JSON required.'},403);
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing event.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return json({error:'Event too large.'},413);}chunks.push(value);}
  let input:unknown;try{input=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(c=>Array.from(c)))));}catch{return json({error:'Invalid JSON.'},400);}
  return analyticsCors(request,await recordAssessmentEvent(request,input));
}
