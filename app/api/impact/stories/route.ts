import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
import {assessmentScope,storyRows} from '../../../../lib/assessment-reporting';
import {cleanAssessmentRetention} from '../../../../lib/assessment-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:'Administrator sign-in is required.'},access);
  const params=new URL(request.url).searchParams,scope=assessmentScope(params),permission=params.get('permission')??'all',cursor=params.get('cursor');
  if(!scope||!['all','permitted','private'].includes(permission)||cursor&&!/^\d{1,12}:\d{1,16}$/.test(cursor))return json({error:'Invalid story filters.'},400);
  const parts=cursor?.split(':').map(Number);if(parts?.some(v=>!Number.isSafeInteger(v)||v<0))return json({error:'Invalid cursor.'},400);
  try{
    const db=analyticsDb();await cleanAssessmentRetention(db);
    const where=`submitted_at>=? AND submitted_at<? AND ${scope.where} AND story IS NOT NULL`+(permission==='all'?'':' AND quote_permission='+ (permission==='permitted'?'1':'0'));
    const args=[scope.range.start,scope.range.end,...scope.args];
    const queries=[db.prepare(`SELECT COUNT(*) AS n FROM impact_assessments WHERE ${where}`).bind(...args),db.prepare(`SELECT rowid AS cursor,id,version,source,submitted_at,story,quote_permission FROM impact_assessments WHERE ${where}${parts?' AND (submitted_at<? OR (submitted_at=? AND rowid<?))':''} ORDER BY submitted_at DESC,rowid DESC LIMIT 26`).bind(...args,...(parts?[parts[0],parts[0],parts[1]]:[]))];
    const results=await db.batch(queries),rows=results[1].results as Record<string,unknown>[],page=rows.slice(0,25),last=page.at(-1);
    return json({items:storyRows(page),total:Number((results[0].results[0] as {n:number}).n),nextCursor:rows.length>25?`${last.submitted_at}:${last.cursor}`:null});
  }catch{return json({error:'The private story library is unavailable.'},503);}
}
