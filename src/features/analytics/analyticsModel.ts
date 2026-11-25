import { parseRoute } from '../../lib/routes';

export const PAGE_LABELS: Record<string,string> = {home:'Home',match:'Find My Wing',explore:'Explore Engineering',major:'Engineering Field Guide',colleges:'Unlock Opportunities',programs:'Student Programs',projects:'Try Projects',universe:'My Universe',aerospace:'Aerospace Labs','aerospace-build':'Aerospace Experiment',sitemap:'Site Map',privacy:'Privacy',analytics:'Analytics',research:'Research & Methodology',credits:'Third-Party Credits and Licenses',terms:'Terms of Use'};
export type AnalyticsEventName = 'Page Viewed' | 'Navigation Clicked' | 'WingMatch Started' | 'WingMatch Completed' | 'Project Test Run' | 'Project Completed' | 'Mission Started' | 'Mission Completed' | 'Recommended Field Explored';
export const EVENT_NAMES: AnalyticsEventName[] = ['Page Viewed','Navigation Clicked','WingMatch Started','WingMatch Completed','Project Test Run','Project Completed','Mission Started','Mission Completed','Recommended Field Explored'];
export type SafeProperties = Record<string,string | number>;
export function pageContext(hash:string): SafeProperties {
  const route=parseRoute(hash);
  const props:SafeProperties={page:route.view,page_label:PAGE_LABELS[route.view] ?? 'Home'};
  if(route.major)props.major=route.major;
  if(route.view==='major')props.tab=route.tab;
  if(route.view==='projects' && ['solar','cooling','bridge'].includes(route.project))props.project=route.project;
  if(route.view==='aerospace-build')props.wing=route.wing;
  return props;
}
// Never copy caller objects, URLs, DOM text, form values, or free text into events.
export function safeProperties(input:Record<string,unknown>): SafeProperties {
  const output:SafeProperties={};
  for(const key of ['page','from_page','to_page'])if(typeof input[key]==='string' && Object.hasOwn(PAGE_LABELS,input[key] as string))output[key]=input[key] as string;
  if(typeof input.page==='string' && Object.hasOwn(PAGE_LABELS,input.page))output.page_label=PAGE_LABELS[input.page];
  for(const key of ['project'])if(['solar','cooling','bridge'].includes(String(input[key])))output[key]=String(input[key]);
  if(typeof input.major==='string' && pageContext('#/major?major='+encodeURIComponent(input.major)).major===input.major)output.major=input.major;
  if(['PLAN','CAREERS','IDEAS','COLLEGES','OPPORTUNITIES'].includes(String(input.tab)))output.tab=String(input.tab);
  if(['propulsion','gnc','structures','thermal','avionics','mission-design'].includes(String(input.wing)))output.wing=String(input.wing);
  if(['header','footer','content','journey'].includes(String(input.placement)))output.placement=String(input.placement);
  if(typeof input.previous_page_seconds==='number' && Number.isFinite(input.previous_page_seconds))output.previous_page_seconds=Math.max(0,Math.min(86400,Math.round(input.previous_page_seconds)));
  return output;
}
export function routeKey(hash:string) { return JSON.stringify(pageContext(hash)); }
