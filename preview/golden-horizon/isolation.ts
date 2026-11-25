import {sample} from './impactFixtures';
import {demoReport} from './researchFixtures';
import {ASSESSMENT_VERSION,ASSESSMENT_VERSIONS,type AssessmentVersion} from '../../src/features/analytics/assessmentModel';
/** Review-only, before app evaluation: no real browser storage or API traffic. */
function memoryStorage():Storage{const values=new Map<string,string>();return {get length(){return values.size;},getItem:k=>values.get(String(k))??null,setItem:(k,v)=>{values.set(String(k),String(v));},removeItem:k=>{values.delete(String(k));},clear:()=>values.clear(),key:i=>[...values.keys()][i]??null};}
for(const key of ['localStorage','sessionStorage']){
 try{Object.defineProperty(window,key,{configurable:true,value:memoryStorage()});}
 catch{document.body.textContent='The isolated preview could not initialize. No progress has been changed.';throw Error('Preview storage isolation unavailable');}
}
let networkRequests=0;
window.fetch=async(input,init)=>{
 networkRequests++;const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,'https://preview.invalid');
 const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 if(init?.signal?.aborted)throw new DOMException('Preview request cancelled','AbortError');
 if(url.pathname==='/api/impact/report')return json(sample);
 if(url.pathname==='/api/impact/assessment-report'||url.pathname==='/api/impact/stories'){
  const requested=url.searchParams.get('version'),version=(ASSESSMENT_VERSIONS as readonly string[]).includes(requested)?requested as AssessmentVersion:ASSESSMENT_VERSION;
  const source=['all','project','wingmatch'].includes(url.searchParams.get('source')??'')?url.searchParams.get('source') as 'all'|'project'|'wingmatch':'wingmatch';
  const result=demoReport(url.searchParams.get('from')??'2026-11-12',url.searchParams.get('to')??'2026-11-14',source,version);
  if(url.pathname.endsWith('/stories')){const permission=url.searchParams.get('permission'),items=result.stories.filter(s=>permission==='permitted'?s.quotePermission:permission==='private'?!s.quotePermission:true);return json({items,total:items.length,nextCursor:null,demo:true});}
  return json({...result.report,previewStories:result.stories});
 }
 if(url.pathname==='/api/analytics/report')return json({demo:true,disclaimer:'SYNTHETIC PREVIEW — NOT PRODUCTION STATISTICS',days:Number(url.searchParams.get('days')??7),since:0,updatedAt:sample.generatedAt,totals:{events:0,sessions:0,page_views:0,navigation_clicks:0},daily:[],pages:[],paths:[],milestones:[],placements:[],lastPages:[],matchConversions:{completed_started_sessions:0}});
 return json({error:'Offline preview. No production request was made.',demo:true,previewRequests:networkRequests},503);
};
// These are also disabled by the existing production-domain and consent guards.
if(typeof navigator.sendBeacon==='function')Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>false});
