import { EVENT_NAMES, safeProperties } from '../src/features/analytics/analyticsModel';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateEvent(input:unknown){
  if(!input || typeof input!=='object' || Array.isArray(input))return null;
  const value=input as Record<string,unknown>;
  if(typeof value.id!=='string' || !uuid.test(value.id) || typeof value.session_id!=='string' || !uuid.test(value.session_id) || !EVENT_NAMES.includes(value.event as typeof EVENT_NAMES[number]))return null;
  if(!value.properties || typeof value.properties!=='object' || Array.isArray(value.properties))return null;
  const properties=safeProperties(value.properties as Record<string,unknown>);
  if(!properties.page || ['analytics','privacy'].includes(String(properties.page)))return null;
  if(['Mission Started','Mission Completed'].includes(String(value.event))&&!(properties.page==='projects'&&properties.project||properties.page==='aerospace-build'&&properties.wing))return null;
  return {id:value.id,sessionId:value.session_id,event:String(value.event),properties};
}
export function reportDays(value:string|null){return value==='1'?1:value==='30'?30:7;}
