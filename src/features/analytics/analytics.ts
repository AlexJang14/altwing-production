import { analyticsEndpoint } from './analyticsEndpoint';
import { writeLocal,invalidateCachedLocal } from '../../lib/storage';
import { EVENT_NAMES, pageContext, routeKey, safeProperties, type AnalyticsEventName } from './analyticsModel';
import {browserPrivacyBlocked,usageTrackingAllowed,productionTrackingAllowed} from './trackingPolicy';
import type {ImpactSubmission} from './impactTypes';
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
export function trackEvent(event:AnalyticsEventName,properties:Record<string,unknown>={}){
  if(/^#\/?progress-transfer(?:\?|$)/.test(location.hash))return;
  if(!EVENT_NAMES.includes(event) || !analyticsEnabled())return;
  const context=pageContext(location.hash);
  if(['analytics','privacy'].includes(String(context.page)))return;
  const clean=safeProperties({...context,...properties});
  // First-party, anonymous, write-only ingestion. No history or identity in the browser.
  const generation=revision;
  const payload={id:crypto.randomUUID(),session_id:sessionId(),event,properties:clean};
  if(['Mission Started','Mission Completed'].includes(event)){
    const key=[payload.session_id,event,clean.project??clean.wing].join(':');if(milestones.has(key))return;milestones.add(key);
  }
  void visitCapability(payload.session_id).then(token=>{
    if(!token || !analyticsEnabled() || generation!==revision)return;
    return fetch(analyticsEndpoint('/api/analytics/events'),{method:'POST',headers:{'Content-Type':'application/json','X-AltWing-Visit':token},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,signal:AbortSignal.timeout(8000)})
      .then(response=>{if(response.status===403 && capabilityCache?.session===payload.session_id)capabilityCache=null;});
  }).catch(()=>{});
}
export async function submitImpactFeedback(value:Omit<ImpactSubmission,'session_id'>){
  if(!productionTrackingAllowed())throw Error('Feedback submission is disabled in development and previews.');
  const id=sessionId(),token=await visitCapability(id);
  if(!token)throw Error('Feedback could not be authorized. Please retry.');
  const response=await fetch(analyticsEndpoint('/api/impact/surveys'),{method:'POST',headers:{'Content-Type':'application/json','X-AltWing-Visit':token},body:JSON.stringify({...value,session_id:id}),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(10000)});
  const result=await response.json() as {error?:string;accepted?:boolean};
  if(!response.ok||!result.accepted){if(response.status===403)capabilityCache=null;throw Error(result.error??'Feedback was not saved. Please retry.');}
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
