import { env } from 'cloudflare:workers';
import { json, analyticsCors, analyticsOriginAllowed, analyticsPreflight } from '../../../../lib/analytics-server';
import { signVisit, validSessionId } from '../../../../lib/analytics-capability';
export const OPTIONS=analyticsPreflight;
export async function POST(request:Request){return analyticsCors(request,await ingest(request));}
async function ingest(request:Request){
  if(!analyticsOriginAllowed(request) || !request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Authorized-origin requests only.'},403);
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing session.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>256){await reader.cancel();return json({error:'Invalid session.'},413);}chunks.push(value);}
  let value:unknown;try{value=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(c=>Array.from(c)))));}catch{return json({error:'Invalid session.'},400);}
  const session=(value as {session_id?:unknown}|null)?.session_id;
  if(!validSessionId(session))return json({error:'Invalid session.'},400);
  if(!env.ANALYTICS_INGEST_SECRET)return json({error:'Statistics unavailable.'},503);
  return json({token:await signVisit(session,env.ANALYTICS_INGEST_SECRET)});
}
