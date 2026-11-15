import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
import {impactRange} from '../../../../lib/impact-validation';
import {cleanImpactRetention} from '../../../../lib/impact-retention';
import {csvCell} from '../../../../src/features/analytics/impactExports';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:'Owner sign-in is required.'},access);
  const params=new URL(request.url).searchParams,range=impactRange(params),kind=params.get('kind')??'ratings';
  if(!range||!['ratings','feedback'].includes(kind))return json({error:'Invalid export period or kind.'},400);
  try{
    const db=analyticsDb();await cleanImpactRetention(db);
    const cutoff=await db.prepare('SELECT COALESCE(MAX(rowid),0) AS maximum FROM impact_surveys').all<{maximum:number}>();
    const maximum=Number(cutoff.results[0].maximum);
    const fields=kind==='feedback'?['source','created_at','testimonial','quote_permission']:['source','created_at','satisfaction','helpfulness','recommendation','understanding_before','understanding_after','legacy_understanding','legacy_direction','legacy_action','quote_permission'];
    let cursor=0,stopped=false;const encoder=new TextEncoder();
    const line=(row:unknown[])=>encoder.encode(row.map(csvCell).join(',')+'\r\n');
    const stream=new ReadableStream<Uint8Array>({
      start(controller){controller.enqueue(line([kind==='feedback'?'PRIVATE FEEDBACK — DO NOT SHARE UNPERMITTED TESTIMONIALS':'ANONYMOUS RATING RESPONSES — NOT UNIQUE PEOPLE',range.from,range.to]));controller.enqueue(line(fields));},
      async pull(controller){
        if(stopped)return;
        try{
          const rows=await db.prepare(`SELECT rowid AS cursor,${fields.join(',')} FROM impact_surveys WHERE rowid>? AND rowid<=? AND created_at>=? AND created_at<?${kind==='feedback'?' AND testimonial IS NOT NULL':''} ORDER BY rowid LIMIT 500`).bind(cursor,maximum,range.start,range.end).all<Record<string,unknown>>();
          for(const row of rows.results){if(stopped)return;cursor=Number(row.cursor);controller.enqueue(line(fields.map(field=>field==='created_at'?new Date(Number(row[field])*1000).toISOString():row[field])));}
          if(rows.results.length<500){controller.close();stopped=true;}
        }catch(error){stopped=true;controller.error(error);}
      },cancel(){stopped=true;},
    });
    return new Response(stream,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${kind==='feedback'?'PRIVATE-feedback':'anonymous-ratings'}-${range.from}-${range.to}.csv"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});
  }catch{return json({error:'Could not create the export. Confirm the impact database migration is applied.'},503);}
}
