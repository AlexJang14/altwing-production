import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
import {assessmentScope} from '../../../../lib/assessment-reporting';
import {cleanAssessmentRetention} from '../../../../lib/assessment-server';
import {csvCell} from '../../../../src/features/analytics/impactExports';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:'Administrator sign-in is required.'},access);
  const params=new URL(request.url).searchParams,scope=assessmentScope(params),kind=params.get('kind')??'responses';
  if(!scope||!['responses','stories','quotes'].includes(kind))return json({error:'Invalid export filters.'},400);
  try{
    const db=analyticsDb();await cleanAssessmentRetention(db);
    const max=await db.prepare('SELECT COALESCE(MAX(rowid),0) AS n FROM impact_assessments').all<{n:number}>(),cutoff=max.results[0].n;
    const fields=kind==='responses'?['version','source','submitted_at','opportunity','reasoning','discovery','motivation','readiness','quote_permission']:['version','source','submitted_at','story','quote_permission'];
    const label=kind==='stories'?'PRIVATE IMPACT STORIES — DO NOT SHARE UNPERMITTED TEXT':kind==='quotes'?'QUOTATION-PERMITTED STORIES — REVIEW IDENTIFYING DETAILS BEFORE SHARING':'CUSTOM QUESTIONNAIRE RESPONSES — NOT A VALIDATED SCALE OR UNIQUE STUDENTS';
    let cursor=0,stopped=false;const encoder=new TextEncoder(),line=(values:unknown[])=>encoder.encode(values.map(csvCell).join(',')+'\r\n');
    const stream=new ReadableStream<Uint8Array>({start(c){c.enqueue(line([label,scope.range.from,scope.range.to,scope.source]));c.enqueue(line(fields));},async pull(controller){
      try{
        const rows=await db.prepare(`SELECT rowid AS cursor,${fields.join(',')} FROM impact_assessments WHERE rowid>? AND rowid<=? AND submitted_at>=? AND submitted_at<? AND ${scope.where}${kind==='responses'?'':' AND story IS NOT NULL'}${kind==='quotes'?' AND quote_permission=1':''} ORDER BY rowid LIMIT 500`).bind(cursor,cutoff,scope.range.start,scope.range.end,...scope.args).all<Record<string,unknown>>();
        for(const row of rows.results){if(stopped)return;cursor=Number(row.cursor);controller.enqueue(line(fields.map(f=>f==='submitted_at'?new Date(Number(row[f])*1000).toISOString():row[f])));}
        if(rows.results.length<500){stopped=true;controller.close();}
      }catch(e){stopped=true;controller.error(e);}
    },cancel(){stopped=true;}});
    return new Response(stream,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="altwing-${scope.version}-${kind}-${scope.range.from}-${scope.range.to}.csv"`,'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
  }catch{return json({error:'Assessment export is unavailable.'},503);}
}
