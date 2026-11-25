import {impactRange} from './impact-validation';
import {assessmentSource,cleanAssessmentRetention} from './assessment-server';
import {assessmentQuestions,ASSESSMENT_VERSION,isAssessmentVersion,type AssessmentReport,type AssessmentDimension,type BehaviorCounts,type ImpactStory} from '../src/features/analytics/assessmentModel';
import {assessmentMethodNotes} from '../src/features/analytics/assessmentMethodology';
export function assessmentScope(params:URLSearchParams){
  const range=impactRange(params),source=params.get('source')??'wingmatch',version=params.get('version')??ASSESSMENT_VERSION;
  if(!range||source!=='all'&&!assessmentSource(source)||!isAssessmentVersion(version))return null;
  return {range,version,source:source as AssessmentReport['source'],where:'version=?'+(source==='all'?'':' AND source=?'),args:source==='all'?[version]:[version,source]};
}
export type AssessmentScope=NonNullable<ReturnType<typeof assessmentScope>>;
export function storyRows(rows:Record<string,unknown>[]):ImpactStory[]{return rows.map(r=>({id:String(r.id),version:String(r.version),source:String(r.source),submittedAt:new Date(Number(r.submitted_at)*1000).toISOString(),text:String(r.story),quotePermission:Number(r.quote_permission)===1}));}
export async function readAssessmentReport(db:D1Database,scope:AssessmentScope):Promise<AssessmentReport>{
  await cleanAssessmentRetention(db);
  const {range,where,args,source,version}=scope,questions=assessmentQuestions(version),window=`submitted_at>=? AND submitted_at<? AND ${where}`,bind=[range.start,range.end,...args];
  const exists=(kind:string,condition:string)=>`EXISTS(SELECT 1 FROM impact_assessment_activity b WHERE b.assessment_id=a.id AND b.kind='${kind}' AND ${condition})`;
  const sums:Record<string,string>={started:'a.started_at IS NOT NULL',responses:'a.submitted_at IS NOT NULL',fieldExplored:exists('field','b.completed_at IS NOT NULL'),projectStarted:exists('project','b.started_at IS NOT NULL'),projectCompleted:exists('project','b.completed_at IS NOT NULL'),projectPaired:exists('project','b.started_at IS NOT NULL AND b.completed_at>=b.started_at'),labStarted:exists('lab','b.started_at IS NOT NULL'),proofSaved:exists('lab','b.completed_at IS NOT NULL'),labPaired:exists('lab','b.started_at IS NOT NULL AND b.completed_at>=b.started_at')};
  const behaviorFields=['field_explorations','project_starts','project_completions','project_conversions','lab_starts','proofs_saved','lab_conversions'];
  const queries=[
    db.prepare(`SELECT COUNT(*) AS responses,COALESCE(SUM(story IS NOT NULL),0) AS stories,COALESCE(SUM(offered_at IS NULL),0) AS unlinked FROM impact_assessments WHERE ${window}`).bind(...bind),
    db.prepare(`SELECT COUNT(*) AS offers,${Object.entries(sums).map(([key,test])=>`COALESCE(SUM(CASE WHEN ${test} THEN 1 ELSE 0 END),0) AS ${key}`).join(',')} FROM impact_assessments a WHERE offered_at>=? AND offered_at<? AND ${where}`).bind(...bind),
    db.prepare(`SELECT ${behaviorFields.map(f=>`COALESCE(SUM(${f}),0) AS ${f}`).join(',')} FROM impact_behavior_daily WHERE day BETWEEN ? AND ?`).bind(range.from,range.to),
    db.prepare('SELECT MIN(day) AS first FROM impact_behavior_daily'),
    db.prepare(`SELECT version,source,COUNT(*) AS responses FROM impact_assessments WHERE submitted_at>=? AND submitted_at<? GROUP BY version,source UNION ALL SELECT version,source,COUNT(*) AS responses FROM impact_surveys WHERE created_at>=? AND created_at<? GROUP BY version,source ORDER BY version,source`).bind(range.start,range.end,range.start,range.end),
    db.prepare(`SELECT id,version,source,submitted_at,story,quote_permission FROM impact_assessments WHERE ${window} AND story IS NOT NULL AND quote_permission=1 ORDER BY submitted_at DESC,rowid DESC LIMIT 10`).bind(...bind),
    ...questions.map(q=>db.prepare(`SELECT ${q.id} AS value,COUNT(*) AS n FROM impact_assessments WHERE ${window} GROUP BY ${q.id}`).bind(...bind)),
    ...questions.map(q=>db.prepare(`SELECT strftime('%Y-%m',submitted_at,'unixepoch') AS month,${q.id} AS value,COUNT(*) AS n FROM impact_assessments WHERE ${window} GROUP BY month,${q.id} ORDER BY month`).bind(...bind)),
    db.prepare(`SELECT strftime('%Y-%m',offered_at,'unixepoch') AS month,COUNT(*) AS offers,COALESCE(SUM(submitted_at IS NOT NULL),0) AS responses FROM impact_assessments WHERE offered_at>=? AND offered_at<? AND ${where} GROUP BY month ORDER BY month`).bind(...bind),
    db.prepare(`SELECT COUNT(*) AS starts,COALESCE(SUM(submitted_at>=started_at),0) AS responses FROM impact_assessments WHERE started_at>=? AND started_at<? AND ${where}`).bind(...bind),
    db.prepare(`SELECT strftime('%Y-%m',started_at,'unixepoch') AS month,COUNT(*) AS starts,COALESCE(SUM(submitted_at>=started_at),0) AS responses FROM impact_assessments WHERE started_at>=? AND started_at<? AND ${where} GROUP BY month ORDER BY month`).bind(...bind),
  ];
  const result=await db.batch(queries),summary=result[0].results[0] as Record<string,number>,c=result[1].results[0] as Record<string,number>;
  const dimensions:AssessmentDimension[]=questions.map((q,index)=>{
    const values=new Map(result[6+index].results.map((row:Record<string,unknown>)=>[String(row.value),Number(row.n)]));
    const excluded=values.get(q.id==='opportunity'?'not_sure':'not_applicable')??0,applicable=summary.responses-excluded;
    return {id:q.id,title:q.title,question:q.question,responses:summary.responses,applicable,excluded,choices:q.options.map(([value,label])=>({value,label,count:values.get(value)??0,percent:['not_sure','not_applicable'].includes(value)||!applicable?null:(values.get(value)??0)/applicable*100})),...(q.id==='opportunity'?{firstTime:{count:values.get('never')??0,known:applicable,notSure:excluded,percent:applicable?(values.get('never')??0)/applicable*100:null}}:{})};
  });
  const trends=questions.flatMap((q,index)=>{
    const rows=result[11+index].results as {month:string;value:string;n:number}[];
    return rows.map(row=>({month:row.month,dimension:q.id,value:row.value,count:Number(row.n),responses:rows.filter(other=>other.month===row.month).reduce((n,r)=>n+Number(r.n),0)}));
  });
  const completion=result[17].results[0] as {starts:number;responses:number};
  return {generatedAt:new Date().toISOString(),range,source,version,responses:Number(summary.responses),stories:Number(summary.stories),unlinkedResponses:Number(summary.unlinked),dimensions,
    completion:{...completion,rate:completion.starts?completion.responses/completion.starts*100:null},completionTrends:(result[18].results as {month:string;starts:number;responses:number}[]).map(r=>({...r,rate:r.starts?r.responses/r.starts*100:null})),
    cohort:{offers:c.offers,started:c.started,responses:c.responses,responseRate:c.offers?c.responses/c.offers*100:null,fieldExplored:c.fieldExplored,projectStarted:c.projectStarted,projectCompleted:c.projectCompleted,projectPaired:c.projectPaired,projectCompletionRate:c.projectStarted?c.projectPaired/c.projectStarted*100:null,labStarted:c.labStarted,proofSaved:c.proofSaved,labPaired:c.labPaired,proofRate:c.labStarted?c.labPaired/c.labStarted*100:null},
    behavior:result[2].results[0] as BehaviorCounts,behaviorAvailableSince:(result[3].results[0] as {first:string|null}).first,
    versions:result[4].results as AssessmentReport['versions'],permittedStories:storyRows(result[5].results as Record<string,unknown>[]),trends,cohortTrends:(result[16].results as {month:string;offers:number;responses:number}[]).map(r=>({...r,rate:r.offers?r.responses/r.offers*100:null})),methodology:assessmentMethodNotes(version)};
}
