import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';

function additionalAdminEmails(value:unknown):string[]{
  if(typeof value!=='string'||value.length>8192)return [];
  try{
    const entries:unknown=JSON.parse(value);
    // Configuration errors deny additional grants; the existing owner is
    // checked separately so a bad optional setting cannot lock that account out.
    if(!Array.isArray(entries)||entries.length>100||entries.some(entry=>typeof entry!=='string'||!/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(entry.trim())))return [];
    return [...new Set(entries.map(entry=>entry.trim().toLowerCase()))];
  }catch{return [];}
}

function analyticsIdentityAuthorization(user:{userId:string;email:string}|null){
  if(!user?.userId.trim()||!user.email.trim())return 401;
  const email=user.email.trim().toLowerCase();
  const owner=env.ANALYTICS_ADMIN_EMAIL?.trim().toLowerCase();
  if(owner&&email===owner)return 200;
  // Exactly the existing owner plus at most one distinct additional grant.
  // An unexpected third account fails closed without locking out the owner.
  const additional=additionalAdminEmails(env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS).filter(value=>value!==owner);
  return owner&&additional.length===1&&additional[0]===email?200:403;
}
export async function analyticsAuthorization(){return analyticsIdentityAuthorization(await getChatGPTUser());}
// Sites dispatch supplies these verified identity headers and strips visitor
// imitations. This entry-point check runs before the framework renders /admin;
// every report/export handler still performs its own authorization as well.
export function analyticsRequestAuthorization(request:Request){
  const userId=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
  return analyticsIdentityAuthorization(userId&&email?{userId,email}:null);
}

export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});}
export function analyticsDb(){if(!env.DB)throw Error('Analytics database is unavailable.');return env.DB;}
export function analyticsOriginAllowed(request:Request){
  const origin=request.headers.get('Origin');if(!origin)return false;
  if(origin===new URL(request.url).origin)return true;
  return (env.ANALYTICS_ALLOWED_ORIGINS??'').split(',').map(value=>value.trim()).filter(Boolean).includes(origin);
}
export function analyticsCors(request:Request,response:Response){
  if(!analyticsOriginAllowed(request))return response;
  response.headers.set('Access-Control-Allow-Origin',request.headers.get('Origin')!);
  response.headers.set('Vary','Cookie, Origin');
  return response;
}
export function analyticsPreflight(request:Request){
  if(!analyticsOriginAllowed(request))return json({error:'Origin is not allowed.'},403);
  return analyticsCors(request,new Response(null,{status:204,headers:{'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-AltWing-Visit','Access-Control-Max-Age':'600'}}));
}
