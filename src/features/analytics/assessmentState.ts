import {readJSON,writeLocal} from '../../lib/storage';
import {ASSESSMENT_VERSION,type AssessmentSource} from './assessmentModel';
const KEY='altwing-impact-assessment-v2';
const COOLDOWN=30*86400000;
export type AssessmentAttempt={id:string;visit:string|null;status:'new'|'shown'|'dismissed'|'submitted';updated:number};
type State={lastAutomatic:number;attempts:Record<string,AssessmentAttempt>};
function state():State{
  const raw=readJSON<Partial<State>>(KEY,{});
  return {lastAutomatic:Number.isFinite(raw.lastAutomatic)?raw.lastAutomatic:0,attempts:raw.attempts&&typeof raw.attempts==='object'&&!Array.isArray(raw.attempts)?raw.attempts:{}};
}
function write(value:State){
  value.attempts=Object.fromEntries(Object.entries(value.attempts).filter(([,a])=>a&&Number.isFinite(a.updated)&&Date.now()-a.updated<90*86400000).sort((a,b)=>b[1].updated-a[1].updated).slice(0,32));
  writeLocal(KEY,JSON.stringify(value));
}
export function assessmentAttempt(context:string,visit:string|null=null):AssessmentAttempt{
  const value=state(),old=value.attempts[context];
  if(old&&/^[0-9a-f-]{36}$/i.test(old.id)&&['new','shown','dismissed','submitted'].includes(old.status)&&(!visit||!old.visit||old.visit===visit||old.status==='submitted')){
    if(visit&&!old.visit){old.visit=visit;write(value);}return {...old};
  }
  const next:AssessmentAttempt={id:crypto.randomUUID(),visit,status:'new',updated:Date.now()};value.attempts[context]=next;write(value);return next;
}
export function mayAutomaticallyOffer(context:string){const value=state(),attempt=value.attempts[context];return (!attempt||attempt.status==='new')&&Date.now()-value.lastAutomatic>=COOLDOWN;}
export function markAssessment(context:string,attempt:AssessmentAttempt,status:AssessmentAttempt['status'],automatic=false){
  const value=state();value.attempts[context]={...attempt,status,updated:Date.now()};if(automatic||status==='submitted')value.lastAutomatic=Date.now();write(value);
}
type Active={id:string;source:AssessmentSource;visit:string};
let memoryActive:Active[]=[];
const ACTIVE_KEY='altwing-assessment-active-'+ASSESSMENT_VERSION;
export function activeAssessments(visit:string):Active[]{
  let value=memoryActive;try{value=JSON.parse(sessionStorage.getItem(ACTIVE_KEY)??'null')??value;}catch{/* Keep memory. */}
  return Array.isArray(value)?value.filter(v=>v&&v.visit===visit&&typeof v.id==='string'&&/^[0-9a-f-]{36}$/i.test(v.id)&&(v.source==='wingmatch'||v.source==='project')).slice(0,2):[];
}
export function activateAssessment(id:string,source:AssessmentSource,visit:string){
  const values=activeAssessments(visit);if(!values.some(v=>v.source===source))values.push({id,source,visit});memoryActive=values;
  try{sessionStorage.setItem(ACTIVE_KEY,JSON.stringify(values));}catch{/* Memory is sufficient when storage is blocked. */}
}
