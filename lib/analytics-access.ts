import {analyticsRequestAuthorization,json} from './analytics-server';

const PUBLIC_INGEST_PATHS=new Set(['/api/analytics/session','/api/analytics/events','/api/impact/surveys','/api/impact/assessment-events']);
function normalizedPath(request:Request){
  let value=new URL(request.url).pathname;
  try{value=decodeURIComponent(value);}catch{/* The framework rejects malformed encodings. */}
  return value.replace(/\/+/g,'/').replace(/\/$/,'')||'/';
}
export function analyticsAccessScope(request:Request):'dashboard'|'login'|'api'|null{
  const path=normalizedPath(request);
  if(path==='/admin/login')return 'login';
  if(path==='/admin'||path.startsWith('/admin/'))return 'dashboard';
  if((path==='/api/analytics'||path.startsWith('/api/analytics/')||path==='/api/impact'||path.startsWith('/api/impact/'))&&!PUBLIC_INGEST_PATHS.has(path))return 'api';
  return null;
}
const deniedHtml='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Access denied</title></head><body><main><h1>Access denied</h1><p>This page is not available.</p></main></body></html>';
export function privateAnalyticsHeaders(response:Response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','private, no-store');headers.set('X-Robots-Tag','noindex, nofollow');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');
  const vary=new Set((headers.get('Vary')??'').split(',').map(value=>value.trim()).filter(Boolean));vary.add('Cookie');headers.set('Vary',[...vary].join(', '));
  headers.delete('ETag');headers.delete('Last-Modified');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
export async function withAnalyticsAccess(request:Request,next:()=>Response|Promise<Response>){
  const scope=analyticsAccessScope(request);
  if(scope==='dashboard'||scope==='api'){
    const access=analyticsRequestAuthorization(request);
    if(access!==200){
      const response=scope==='api'?json({error:'Access denied.'},access):new Response(request.method==='HEAD'?null:deniedHtml,{status:404,headers:{'Content-Type':'text/html; charset=utf-8'}});
      return privateAnalyticsHeaders(response);
    }
  }
  const response=await next();
  return scope?privateAnalyticsHeaders(response):response;
}
