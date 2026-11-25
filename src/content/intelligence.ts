import rawSnapshot from '../../content/intelligence/published.json';
import rawHealth from '../../content/intelligence/health.json';

type Kind='college'|'opportunity';
export type ContentRecord={id:string;legacy_id:string|null;kind:string;facts:{name:string;organization:string;disciplines:string[];grades:number[]|null;application_url:string;source_url:string;deadline:string|null;opening_date:string|null;application_cycle:string|null;source_status:string|null;[key:string]:unknown};display:Record<string,unknown>;first_discovered_at:string;imported_legacy:boolean;last_changed_at:string|null;verification:{status:string;last_verified_at:string|null;verified_fields:string[];evidence:Array<{field:string;source_id:string;url:string;observed_at:string}>};lifecycle:{status:string}};
const snapshot=rawSnapshot as unknown as {snapshot_id:string;records:ContentRecord[]};
const health=rawHealth as unknown as {snapshot_id:string;sources:Record<string,{status:string;record_id?:string;last_attempt_at?:string;last_success_at?:string;link_failure?:string|null}>};
const byId=new Map(snapshot.records.map(r=>[r.id,r]));
const opportunityKinds=new Set(['internship','research','summer_program','competition','scholarship','mentorship']);
export function contentRecord(kind:Kind,id:string){return byId.get((kind==='college'?'college:':'opportunity:')+id);}
export function contentStatus(record:ContentRecord|undefined,now=new Date()){
  if(!record)return 'unknown';const f=record.facts,verified=record.verification.verified_fields;
  if(f.deadline&&verified.includes('deadline')){
    const end=new Date(f.deadline).getTime()+(f.deadline.length===10?2*86400000:0),left=Math.floor(new Date(f.deadline).getTime()/86400000)-Math.floor(now.getTime()/86400000);
    if(now.getTime()>end)return 'archived';if(left<=14)return 'closing_soon';
    if(f.opening_date&&verified.includes('opening_date')&&now.getTime()>=new Date(f.opening_date).getTime()+(f.opening_date.length===10?86400000:0))return 'open_now';
    return 'upcoming';
  }
  if(f.source_status==='closed'&&verified.includes('source_status'))return 'archived';
  if(f.source_status==='next_cycle_pending'&&verified.includes('source_status'))return 'next_cycle_pending';
  return f.source_status==='open'&&verified.includes('source_status')?'open_now':'cycle_unverified';
}
export function freshness(kind:Kind,id:string,now=new Date()){
 const record=contentRecord(kind,id);if(!record)return null;
 const labels:string[]=[],v=record.verification,day=86400000;
 if(kind==='opportunity'){
  const status=contentStatus(record,now);labels.push(status==='open_now'?'Open now':status==='closing_soon'?'Closing soon':status==='archived'?'Archived cycle':status==='upcoming'?'Upcoming':status==='next_cycle_pending'?'Next cycle pending':'Check current cycle');
 }
 if(!record.imported_legacy&&v.status==='verified'&&(now.getTime()-Date.parse(record.first_discovered_at))/day<=7)labels.push('New this week');
 if(record.last_changed_at&&(now.getTime()-Date.parse(record.last_changed_at))/day<=14)labels.push('Recently updated');
 const sourceFailure=health.snapshot_id===snapshot.snapshot_id&&(v.evidence.some(e=>['unavailable','incomplete'].includes(health.sources[e.source_id]?.status??''))||Object.values(health.sources).some(s=>s.record_id===record.id&&(Boolean(s.link_failure)||['unavailable','incomplete'].includes(s.status)))||(kind==='college'&&id.startsWith('scorecard-')&&['unavailable','incomplete'].includes(health.sources['college-scorecard']?.status??'')));
 const last=v.last_verified_at?new Date(v.last_verified_at).toISOString().slice(0,10):null;
 const stale=last&&(now.getTime()-Date.parse(last))/day>(kind==='college'?45:14);
 if(sourceFailure)labels.push('Source unavailable · retained last known facts');else if(stale)labels.push('Source review due');
 return {labels,lastVerified:last,verification:v.status,verifiedFields:v.verified_fields,applicationUrl:record.facts.application_url,sourceUrl:v.evidence.at(-1)?.source_id==='college-scorecard'?'https://collegescorecard.ed.gov/data/':v.evidence.at(-1)?.url??record.facts.source_url};
}
const collegeFields=new Set(['name','shortName','location','state','admissionRate','act25','act75','tuitionInState','tuitionOutOfState','sourceYear','source','sourceUrl','testingPolicy','testingPolicyNote','engineeringMajors']);
const opportunityFields=new Set(['title','organization','category','location','state','format','status','timing','eligibility','cost','costBand','description','majors','grades','officialUrl','lastVerified','needsGradeCheck']);
export function mergePublicContent<T extends {id:string}>(base:T[],kind:Kind):T[]{
 const allowed=kind==='college'?collegeFields:opportunityFields;
 const merged=base.map(original=>{
  const record=contentRecord(kind,original.id);if(!record)return original;
  const patch=Object.fromEntries(Object.entries(record.display).filter(([k])=>allowed.has(k)));
  const status=kind==='opportunity'?contentStatus(record):'unknown';
  const badge=status==='open_now'?'OPEN':status==='upcoming'?'UPCOMING':['archived','next_cycle_pending','closing_soon'].includes(status)?'WATCH':null;
  return {...original,...patch,...(badge?{status:badge}:{}),id:original.id};
 });
 const existing=new Set(base.map(r=>r.id));
 for(const record of snapshot.records){
  if(!record.legacy_id||existing.has(record.legacy_id)||!['verified','partially_verified'].includes(record.verification.status))continue;
  const f=record.facts;
  if(kind==='opportunity'&&opportunityKinds.has(record.kind)){
   const category=({internship:'INTERNSHIP',research:'RESEARCH',summer_program:'SUMMER PROGRAM',competition:'COMPETITION',scholarship:'SCHOLARSHIP',mentorship:'MENTORSHIP'} as Record<string,string>)[record.kind];
   const proof=record.verification.verified_fields,grades=proof.includes('grades')&&f.grades?f.grades.map(String):[];
   const item={id:record.legacy_id,title:f.name,organization:f.organization,category,location:f.location??'Not published — check official source',format:f.format??'UNKNOWN',status:'WATCH',timing:f.deadline?'Published deadline: '+f.deadline:'Application cycle/deadline not confirmed',eligibility:'Check the official source for full age, grade, citizenship and residency conditions.',cost:f.cost??'Not published — check official source',costBand:'UNKNOWN',description:'Source-linked opportunity. Review the organizer’s current conditions before applying.',majors:f.disciplines,grades,needsGradeCheck:!grades.length,officialUrl:f.application_url,lastVerified:record.verification.last_verified_at?.slice(0,10)??'',...record.display};
   merged.push(item as unknown as T);existing.add(record.legacy_id);
  }else if(kind==='college'&&record.kind==='college'){
   const item={id:record.legacy_id,name:f.name,shortName:f.name,location:f.location??'See university',state:'',engineeringMajors:[],majorCoverage:'ENGINEERING_GENERAL',description:'Engineering directory lead. Confirm the exact major with the university.',admissionsUrl:f.application_url,engineeringUrl:f.application_url,sat25:null,sat50:null,sat75:null,act25:null,act50:null,act75:null,averageGpa:'Not provided',admissionRate:'Not provided',testingPolicy:'Check current university policy',testingPolicyNote:'Directory statistics are not current admission requirements.',source:'Official source',sourceYear:'See source context',sourceUrl:f.source_url,...record.display};merged.push(item as unknown as T);existing.add(record.legacy_id);
  }
 }
 return merged;
}
export const contentSnapshotIdentity=snapshot.snapshot_id;
