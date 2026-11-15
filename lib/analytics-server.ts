import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export async function analyticsAuthorization(){
  const user=await getChatGPTUser();
  if(!user)return 401;
  const allowed=env.ANALYTICS_ADMIN_EMAIL?.trim().toLowerCase();
  return allowed && user.email.toLowerCase()===allowed?200:403;
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
