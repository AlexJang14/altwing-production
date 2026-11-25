import {env} from 'cloudflare:workers';
import {analyticsDb,json} from './analytics-server';
import {verifyVisit,validSessionId} from './analytics-capability';
import {isAssessmentVersion,STORY_MAX_CHARACTERS,STORY_MAX_WORDS,storyWordCount,validAssessmentAnswers,type AssessmentSubmission,type AssessmentEventSubmission} from '../src/features/analytics/assessmentModel';
import {ENGINEERING_MAJOR_MAP} from '../src/features/guidance/engineeringMajors';

export function assessmentSource(value:unknown){return value==='wingmatch'||value==='project';}
export function validateAssessment(input:unknown):AssessmentSubmission|null{
  if(!input||typeof input!=='object'||Array.isArray(input))return null;
  const v=input as Record<string,unknown>;
  const keys=['id','session_id','version','source','answers','story','quote_permission','feedback_permission'];
  if(Object.keys(v).some(k=>!keys.includes(k))||!validSessionId(v.id)||!validSessionId(v.session_id)||!isAssessmentVersion(v.version)||!assessmentSource(v.source)||!validAssessmentAnswers(v.answers,v.version)||v.feedback_permission!==true||typeof v.quote_permission!=='boolean'||typeof v.story!=='string')return null;
  const story=v.story.trim();
  const controls=Array.from(story).some(char=>{const n=char.charCodeAt(0);return n<9||n===11||n===12||n>=14&&n<32;});
  if(story.length>STORY_MAX_CHARACTERS||storyWordCount(story)>STORY_MAX_WORDS||controls||/[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\/|www\.|(?:\+?\d[\d ().-]{7,}\d)/i.test(story)||v.quote_permission&&!story)return null;
  return {id:v.id,session_id:v.session_id,version:v.version,source:v.source as AssessmentSubmission['source'],answers:v.answers,story,quote_permission:v.quote_permission,feedback_permission:true};
}
export function validateAssessmentEvent(input:unknown):AssessmentEventSubmission|null{
  if(!input||typeof input!=='object'||Array.isArray(input))return null;
  const v=input as Record<string,unknown>;
  if(Object.keys(v).some(k=>!['id','session_id','version','source','event','activity'].includes(k))||!validSessionId(v.id)||!validSessionId(v.session_id)||!isAssessmentVersion(v.version)||!assessmentSource(v.source))return null;
  const lifecycle=['offered','started','dismissed'];
  const projects=['solar','cooling','bridge'],wings=['propulsion','gnc','structures','thermal','avionics','mission-design'];
  if(lifecycle.includes(String(v.event))){if(v.activity!==undefined)return null;}
  else if(v.event==='field_explored'){if(typeof v.activity!=='string'||!Object.hasOwn(ENGINEERING_MAJOR_MAP,v.activity))return null;}
  else if(['project_started','project_completed'].includes(String(v.event))){if(!projects.includes(String(v.activity)))return null;}
  else if(['lab_started','proof_saved'].includes(String(v.event))){if(!wings.includes(String(v.activity)))return null;}
  else return null;
  return v as AssessmentEventSubmission;
}
export async function cleanAssessmentRetention(db:D1Database,now=Math.floor(Date.now()/1000)){
  await db.batch([
    db.prepare('UPDATE impact_assessments SET session_id=NULL WHERE session_id IS NOT NULL AND created_at<?').bind(now-90*86400),
    db.prepare('UPDATE impact_assessments SET story=NULL,quote_permission=0 WHERE story IS NOT NULL AND submitted_at<?').bind(now-365*86400),
    db.prepare('DELETE FROM impact_behavior_activity WHERE last_seen<?').bind(now-90*86400),
  ]);
}
export async function saveAssessment(request:Request,input:unknown){
  const data=validateAssessment(input);
  if(!data)return json({error:'To submit, answer all five questions and check the optional story length. Leave out names, contact details and links.'},400);
  if(!await verifyVisit(request.headers.get('X-AltWing-Visit'),data.session_id,env.ANALYTICS_INGEST_SECRET))return json({error:'Visit authorization expired. Please retry.'},403);
  try{
    const db=analyticsDb(),now=Math.floor(Date.now()/1000),a=data.answers;
    await cleanAssessmentRetention(db,now);
    const prior=await db.prepare('SELECT * FROM impact_assessments WHERE id=? OR (session_id=? AND version=? AND source=?)').bind(data.id,data.session_id,data.version,data.source).all<Record<string,unknown>>();
    const row=prior.results[0];
    if(row&&(row.id!==data.id||row.session_id!==data.session_id||row.version!==data.version||row.source!==data.source))return json({error:'An assessment is already associated with this visit. Your results and rewards remain available.'},409);
    const expected={...a,story:data.story||null,quote_permission:data.quote_permission?1:0,feedback_permission:1};
    if(row?.submitted_at){
      if(Object.entries(expected).some(([key,value])=>row[key]!==value))return json({error:'A previous version was already saved. This retry did not change its answers or quotation permission.'},409);
      return json({accepted:true,recorded:false},202);
    }
    const inserted=await db.prepare(`INSERT INTO impact_assessments(id,session_id,version,source,created_at,submitted_at,opportunity,reasoning,discovery,motivation,readiness,story,quote_permission,feedback_permission)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1)
      ON CONFLICT(id) DO UPDATE SET submitted_at=excluded.submitted_at,opportunity=excluded.opportunity,reasoning=excluded.reasoning,discovery=excluded.discovery,motivation=excluded.motivation,readiness=excluded.readiness,story=excluded.story,quote_permission=excluded.quote_permission,feedback_permission=1
      WHERE impact_assessments.submitted_at IS NULL AND impact_assessments.session_id=excluded.session_id AND impact_assessments.version=excluded.version AND impact_assessments.source=excluded.source`)
      .bind(data.id,data.session_id,data.version,data.source,now,now,a.opportunity,a.reasoning,a.discovery,a.motivation,a.readiness,data.story||null,data.quote_permission?1:0).run();
    // A readback handles racing retries without overwriting a saved response.
    const saved=await db.prepare('SELECT opportunity,reasoning,discovery,motivation,readiness,story,quote_permission,feedback_permission FROM impact_assessments WHERE id=? AND session_id=?').bind(data.id,data.session_id).all<Record<string,unknown>>();
    if(!saved.results[0]||Object.entries(expected).some(([key,value])=>saved.results[0][key]!==value))return json({error:'An earlier response was saved. This request did not replace it.'},409);
    return json({accepted:true,recorded:inserted.meta.changes>0},202);
  }catch{return json({error:'Your assessment could not be saved. Your results and rewards are available; retry if you wish to submit.'},503);}
}
export async function recordAssessmentEvent(request:Request,input:unknown){
  const data=validateAssessmentEvent(input);if(!data)return json({error:'Invalid assessment event.'},400);
  if(!await verifyVisit(request.headers.get('X-AltWing-Visit'),data.session_id,env.ANALYTICS_INGEST_SECRET))return json({error:'Visit authorization required.'},403);
  if(request.headers.get('DNT')==='1'||request.headers.get('Sec-GPC')==='1')return json({accepted:true,recorded:false},202);
  try{
    const db=analyticsDb(),now=Math.floor(Date.now()/1000);
    const existing=await db.prepare('SELECT id,session_id,version,source FROM impact_assessments WHERE id=? OR (session_id=? AND version=? AND source=?)').bind(data.id,data.session_id,data.version,data.source).all<Record<string,unknown>>();
    if(existing.results.some(row=>row.id!==data.id||row.session_id!==data.session_id||row.version!==data.version||row.source!==data.source))return json({error:'Assessment visit does not match.'},409);
    const column=({offered:'offered_at',started:'started_at',dismissed:'dismissed_at'} as Record<string,string>)[data.event];
    if(column){
      const saved=await db.prepare(`INSERT INTO impact_assessments(id,session_id,version,source,created_at,${column}) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET ${column}=COALESCE(impact_assessments.${column},excluded.${column}) WHERE impact_assessments.session_id=excluded.session_id AND impact_assessments.version=excluded.version AND impact_assessments.source=excluded.source`).bind(data.id,data.session_id,data.version,data.source,now,now).run();
      if(!saved.meta.changes)return json({error:'Assessment visit does not match.'},409);
    }else{
      // Behavioral conversion is attributed only to a recorded offer from the
      // same anonymous visit. No offer or start is inferred from a completion.
      const row=await db.prepare('SELECT offered_at FROM impact_assessments WHERE id=? AND session_id=? AND version=? AND source=?').bind(data.id,data.session_id,data.version,data.source).all<{offered_at:number|null}>();
      if(!row.results[0]?.offered_at)return json({accepted:true,recorded:false},202);
      const kind=data.event==='field_explored'?'field':data.event.startsWith('project')?'project':'lab';
      const start=data.event.endsWith('started')?now:null,end=start===null?now:null;
      await db.prepare(`INSERT INTO impact_assessment_activity(key,assessment_id,kind,activity,started_at,completed_at) VALUES(?,?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET started_at=COALESCE(impact_assessment_activity.started_at,excluded.started_at),completed_at=COALESCE(impact_assessment_activity.completed_at,excluded.completed_at)`)
        .bind([data.id,kind,data.activity].join(':'),data.id,kind,data.activity,start,end).run();
    }
    return json({accepted:true,recorded:true},202);
  }catch{return json({error:'Measurement temporarily unavailable.'},503);}
}
