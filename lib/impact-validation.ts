import { validSessionId } from './analytics-capability';
import { IMPACT_VERSION, type ImpactSubmission } from '../src/features/analytics/impactTypes';
const score=(value:unknown,min=1,max=5)=>value===null||value===undefined?null:Number.isInteger(value)&&Number(value)>=min&&Number(value)<=max?Number(value):undefined;
export function validateImpact(input:unknown):ImpactSubmission|null{
  if(!input||typeof input!=='object'||Array.isArray(input))return null;
  const value=input as Record<string,unknown>;
  const keys=['id','session_id','version','source','satisfaction','helpfulness','recommendation','understanding_before','understanding_after','legacy_understanding','legacy_direction','legacy_action','testimonial','quote_permission','feedback_permission'];
  if(Object.keys(value).some(key=>!keys.includes(key))||!validSessionId(value.id)||!validSessionId(value.session_id)||value.version!==IMPACT_VERSION||!['wingmatch','legacy-wingmatch','site'].includes(String(value.source))||value.feedback_permission!==true||typeof value.quote_permission!=='boolean'||typeof value.testimonial!=='string')return null;
  const result={id:value.id,session_id:value.session_id,version:IMPACT_VERSION,source:value.source,testimonial:value.testimonial.trim(),quote_permission:value.quote_permission,feedback_permission:true} as ImpactSubmission;
  for(const key of ['satisfaction','helpfulness','understanding_before','understanding_after','legacy_understanding','legacy_direction','legacy_action'] as const){const rating=score(value[key]);if(rating===undefined)return null;result[key]=rating;}
  const recommendation=score(value.recommendation,0,10);if(recommendation===undefined)return null;result.recommendation=recommendation;
  if(result.testimonial.length>1000||Array.from(result.testimonial).some(char=>{const n=char.charCodeAt(0);return n<9||n===11||n===12||n>=14&&n<32;})||/[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\/|www\.|(?:\+?\d[\d ().-]{7,}\d)/i.test(result.testimonial))return null;
  if(result.quote_permission&&!result.testimonial)return null;
  if(result.source==='legacy-wingmatch'){
    if(!result.legacy_understanding||!result.legacy_direction||!result.legacy_action)return null;
    if([result.satisfaction,result.helpfulness,result.recommendation,result.understanding_before,result.understanding_after].some(v=>v!==null))return null;
  }else{
    if(!result.satisfaction||!result.helpfulness||result.recommendation===null||!result.understanding_after)return null;
    if([result.legacy_understanding,result.legacy_direction,result.legacy_action].some(v=>v!==null))return null;
  }
  return result;
}
export function impactRange(params:URLSearchParams,now=new Date()){
  const today=now.toISOString().slice(0,10),allTime=params.get('range')==='all';
  const from=allTime?'1970-01-01':params.get('from')??new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-29)).toISOString().slice(0,10);
  const to=allTime?today:params.get('to')??today;
  const valid=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  if(!valid(from)||!valid(to)||from>to||to>today)return null;
  return {from,to,allTime,start:Date.parse(from+'T00:00:00Z')/1000,end:Date.parse(to+'T00:00:00Z')/1000+86400};
}
