import { analyticsEndpoint } from './analyticsEndpoint';
import { writeLocal,invalidateCachedLocal } from '../../lib/storage';
import { EVENT_NAMES, pageContext, routeKey, safeProperties, type AnalyticsEventName } from './analyticsModel';
import {browserPrivacyBlocked,usageTrackingAllowed,productionTrackingAllowed,privateAnalyticsRoute} from './trackingPolicy';
import type {ImpactSubmission} from './impactTypes';
import {ASSESSMENT_VERSION,type AssessmentSubmission,type AssessmentEventSubmission} from './assessmentModel';
import {activateAssessment,activeAssessments} from './assessmentState';
import {readEngineeringMatch} from '../guidance/guidanceStorage';
const listeners=new Set<()=>void>();
let revision=0,lastKey='',lastPage='',lastTime=0;
let fallbackSession={id:crypto.randomUUID(),last:0};
try{sessionStorage.removeItem('altwing-analytics-session-v1');sessionStorage.removeItem('altwing-mixpanel-session-id');}catch{/* Old diagnostics are no longer used. */}
export function subscribeAnalytics(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function analyticsRevision(){return revision;}
export function doNotTrack(){return browserPrivacyBlocked();}
export function analyticsEnabled(){return usageTrackingAllowed();}
export function setAnalyticsConsent(value:'yes'|'no'){writeLocal('altwing-analytics-consent-v1',value);lastKey='';lastPage='';lastTime=0;revision++;listeners.forEach(fn=>fn());if(typeof window!=='undefined')window.dispatchEvent(new Event('altwing:analytics-consent'));}
if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('storage',event=>{
  if(event.key!==null&&event.key!=='altwing-analytics-consent-v1')return;
  invalidateCachedLocal('altwing-analytics-consent-v1');lastKey='';lastPage='';lastTime=0;revision++;listeners.forEach(fn=>fn());window.dispatchEvent(new Event('altwing:analytics-consent'));
});
function sessionId(){
  let value=fallbackSession;const now=Date.now();
  try{const stored=JSON.parse(sessionStorage.getItem('altwing-visit-session-v1')??'null');if(stored && typeof stored.id==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored.id) && Number.isFinite(stored.last) && stored.last<=now)value=stored;}catch{/* Use memory fallback. */}
  if(now<value.last || now-value.last>30*60*1000){value={id:crypto.randomUUID(),last:now};lastPage='';lastTime=0;lastKey='';}
  value.last=now;fallbackSession=value;
  try{sessionStorage.setItem('altwing-visit-session-v1',JSON.stringify(value));}catch{/* Use memory fallback. */}
  return value.id;
}
type CapabilityEntry={session:string;expires:number;promise:Promise<string|null>};
let capabilityCache:CapabilityEntry|null=null;
function visitCapability(id:string){
  if(capabilityCache?.session===id && Date.now()<capabilityCache.expires)return capabilityCache.promise;
  const entry:CapabilityEntry={session:id,expires:Date.now()+55*60*1000,promise:Promise.resolve(null)};
  entry.promise=fetch(analyticsEndpoint('/api/analytics/session'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:id}),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)})
    .then(async response=>{if(!response.ok)return null;const value=await response.json() as {token?:unknown};return typeof value.token==='string'?value.token:null;}).catch(()=>null)
    .then(token=>{if(!token)entry.expires=Date.now()+5000;return token;});
  capabilityCache=entry;return entry.promise;
}
const milestones=new Set<string>();
export function anonymousAssessmentVisit(){return sessionId();}
const assessmentQueue=new Map<string,Promise<unknown>>();
export function trackAssessmentEvent(value:Omit<AssessmentEventSubmission,'session_id'|'version'>){
  if(!analyticsEnabled()||privateAnalyticsRoute(location.hash))return;
  const visit=sessionId(),generation=revision;
  if(value.event==='offered')activateAssessment(value.id,value.source,visit);
  const previous=assessmentQueue.get(value.id)??Promise.resolve();
  const pending=previous.catch(()=>{}).then(async()=>{
    if(!analyticsEnabled()||privateAnalyticsRoute(location.hash)||generation!==revision)return;
    const token=await visitCapability(visit);if(!token||!analyticsEnabled()||privateAnalyticsRoute(location.hash)||generation!==revision)return;
    await fetch(analyticsEndpoint('/api/impact/assessment-events'),{method:'POST',headers:{'Content-Type':'application/json','X-AltWing-Visit':token},body:JSON.stringify({...value,version:ASSESSMENT_VERSION,session_id:visit}),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(8000)});
  }).catch(()=>{});
  assessmentQueue.set(value.id,pending);void pending.finally(()=>{if(assessmentQueue.get(value.id)===pending)assessmentQueue.delete(value.id);});
}
export function trackEvent(event:AnalyticsEventName,properties:Record<string,unknown>={}){
  if(/^#\/?progress-transfer(?:\?|$)/.test(location.hash))return;
  if(!EVENT_NAMES.includes(event) || !analyticsEnabled())return;
  const context=pageContext(location.hash);
  if(['analytics','privacy'].includes(String(context.page)))return;
  const clean=safeProperties({...context,...properties});
  // First-party, anonymous, write-only ingestion. No history or identity in the browser.
  const generation=revision;
  const payload={id:crypto.randomUUID(),session_id:sessionId(),event,properties:clean};
  let milestoneKey:string|null=null;
  if(['Mission Started','Mission Completed','Recommended Field Explored'].includes(event)){
    milestoneKey=[payload.session_id,event,clean.project??clean.wing??clean.major].join(':');if(milestones.has(milestoneKey))return;milestones.add(milestoneKey);
  }
  const release=()=>{if(milestoneKey)milestones.delete(milestoneKey);};
  const eventCohorts=activeAssessments(payload.session_id);
  void visitCapability(payload.session_id).then(token=>{
    if(!token || !analyticsEnabled() || generation!==revision){release();return;}
    return fetch(analyticsEndpoint('/api/analytics/events'),{method:'POST',headers:{'Content-Type':'application/json','X-AltWing-Visit':token},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(8000)})
      .then(response=>{
        if(response.status===403 && capabilityCache?.session===payload.session_id)capabilityCache=null;
        if(!response.ok){release();return;}
        const kind=event==='Recommended Field Explored'?'field_explored':event==='Mission Started'?clean.project?'project_started':'lab_started':event==='Mission Completed'?clean.project?'project_completed':'proof_saved':null;
        if(kind)for(const cohort of eventCohorts)trackAssessmentEvent({id:cohort.id,source:cohort.source,event:kind,activity:String(clean.project??clean.wing??clean.major)});
      });
  }).catch(release);
}
export async function submitImpactFeedback(value:Omit<ImpactSubmission,'session_id'>|Omit<AssessmentSubmission,'session_id'>){
  if(!productionTrackingAllowed())throw Error('Feedback submission is disabled in development and previews.');
  const id=sessionId(),token=await visitCapability(id);
  if(!token)throw Error('We could not start a secure submission. Your answers are still here. Check your connection and try again.');
  let response:Response;
  try{
    response=await fetch(analyticsEndpoint('/api/impact/surveys'),{method:'POST',headers:{'Content-Type':'application/json','X-AltWing-Visit':token},body:JSON.stringify({...value,session_id:id}),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(10000)});
  }catch(error){
    const timeout=error instanceof Error&&['AbortError','TimeoutError'].includes(error.name);
    throw Error(timeout?'Submission took too long. Your answers are still here; try again.':'We could not reach AltWing. Your answers are still here. Check your connection and try again.');
  }
  let result:{error?:unknown;accepted?:unknown}|null=null;
  try{const body:unknown=await response.json();if(body&&typeof body==='object')result=body as typeof result;}catch{/* An HTML/proxy error must not appear as a JSON parser exception. */}
  if(!response.ok||result?.accepted!==true){
    if(response.status===403)capabilityCache=null;
    const fallback=response.status===429?'Please wait a moment before trying again. Your answers are still here.':response.status===409?'A response for this experience is already recorded. Your earned results and rewards are unchanged.':response.status===400?'Some responses could not be accepted. Review your answers and try again.':'AltWing could not confirm that your responses were saved. Your answers are still here; please try again.';
    throw Error(typeof result?.error==='string'&&result.error.trim()?result.error:fallback);
  }
  return true;
}
export function trackPage(hash:string){
  if(/^#\/?progress-transfer(?:\?|$)/.test(hash)){lastKey='';lastPage='';lastTime=0;return;}
  if(!analyticsEnabled()){lastKey='';lastPage='';lastTime=0;return;}
  sessionId();const key=routeKey(hash),context=pageContext(hash);
  if(key===lastKey)return;
  const previous=lastPage,now=Date.now(),seconds=lastTime?(now-lastTime)/1000:0;
  lastKey=key;lastPage=String(context.page);lastTime=now;
  if(['analytics','privacy'].includes(String(context.page)))return;
  trackEvent('Page Viewed',{...context,...(previous && !['analytics','privacy'].includes(previous)?{from_page:previous,previous_page_seconds:seconds}:{})});
  if(context.page==='major'&&readEngineeringMatch()?.rankings.slice(0,3).some(item=>item.majorId===context.major))trackEvent('Recommended Field Explored',context);
}
export function trackNavigation(event:MouseEvent){
  if(!(event.target instanceof Element))return;
  const link=event.target.closest<HTMLAnchorElement>('a[href^="#/"]');
  if(!link || event.defaultPrevented || /^#\/?progress-transfer(?:\?|$)/.test(link.hash))return;
  const destination=pageContext(link.hash);
  if(['analytics','privacy'].includes(String(destination.page)))return;
  const placement=link.closest('.aw-header')?'header':link.closest('.aw-footer')?'footer':link.closest('.aw-context')?'journey':'content';
  trackEvent('Navigation Clicked',{to_page:destination.page,placement});
}
