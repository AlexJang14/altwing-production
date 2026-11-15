import {usageTrackingAllowed,privateAnalyticsRoute} from './trackingPolicy';
// This is Cloudflare's PUBLIC site/beacon identifier, not an API credential.
export const CLOUDFLARE_SITE_TOKEN='6d42f06f4b9f490988f46600a83380e8';
let loaded=false,disarmed=false,guardsInstalled=false;
function safeAddress(address:Pick<Location,'search'|'hash'>=location){
  if(address.search)return false;
  const path=address.hash.replace(/^#\/?/,'').split('?')[0];
  if(!['','home','match','explore','major','colleges','programs','counselor','universe','projects','aerospace','aerospace-build','sitemap'].includes(path))return false;
  const query=(address.hash.split('?')[1]??'');
  return [...new URLSearchParams(query)].every(([key,value])=>
    key==='project'&&['solar','cooling','bridge'].includes(value)||key==='wing'&&['propulsion','gnc','structures','thermal','avionics','mission-design'].includes(value)||key==='tab'&&['PLAN','CAREERS','IDEAS','COLLEGES','OPPORTUNITIES'].includes(value)||key==='major'&&['aerospace','mechanical','electrical','computer','chemical','biomedical','civil','industrial','materials','environmental','nuclear','robotics','software','petroleum'].includes(value));
}
function maySend(){const permitted=usageTrackingAllowed()&&!privateAnalyticsRoute(location.hash)&&safeAddress();if(loaded&&!permitted)disarmed=true;return !disarmed&&permitted;}
function cloudflareDestination(value:unknown){
  try{const url=new URL(value instanceof Request?value.url:String(value),location.href);return url.hostname==='cloudflareinsights.com'||url.hostname.endsWith('.cloudflareinsights.com')||url.origin===location.origin&&url.pathname==='/cdn-cgi/rum';}catch{return false;}
}
function installPrivacyGuards(){
  if(guardsInstalled)return;guardsInstalled=true;
  // A loaded third-party script cannot be unloaded by removing its tag. Guard
  // only its telemetry destinations so revocation also blocks unload beacons.
  if(typeof navigator.sendBeacon==='function'){
    const original=navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon=(url,data)=>cloudflareDestination(url)&&!maySend()?false:original(url,data);
  }
  const originalFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>cloudflareDestination(input)&&!maySend()?Promise.resolve(new Response(null,{status:204})):originalFetch(input,init);
  const proto=XMLHttpRequest.prototype,originalOpen=proto.open,originalSend=proto.send,destinations=new WeakMap<XMLHttpRequest,string>();
  proto.open=function(method:string,url:string|URL,async=true,username?:string|null,password?:string|null){destinations.set(this,String(url));return originalOpen.call(this,method,url,async,username,password);};
  proto.send=function(body?:Document|XMLHttpRequestBodyInit|null){if(cloudflareDestination(destinations.get(this))&&!maySend()){this.abort();return;}return originalSend.call(this,body);};
}
export function syncCloudflareBeacon(){
  if(!usageTrackingAllowed()||privateAnalyticsRoute(location.hash)||!safeAddress()){
    if(loaded)disarmed=true;
    return;
  }
  if(loaded||disarmed)return;
  installPrivacyGuards();loaded=true;
  // React StrictMode, repeated route effects and existing injection share one tag.
  if(document.querySelector('script[src^="https://static.cloudflareinsights.com/beacon.min.js"]'))return;
  const script=document.createElement('script');script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';script.setAttribute('data-cf-beacon',JSON.stringify({token:CLOUDFLARE_SITE_TOKEN}));script.setAttribute('data-altwing-cloudflare','true');
  document.body.appendChild(script);
}
export function startCloudflareBeacon(){
  const navigation=(window as Window & {navigation?:EventTarget}).navigation;
  const beforeNavigation=(event:Event)=>{
    const destination=(event as Event & {destination?:{url?:string}}).destination?.url;if(!destination||!loaded)return;
    try{const url=new URL(destination,location.href);if(url.origin===location.origin&&(privateAnalyticsRoute(url.hash)||!safeAddress(url)))disarmed=true;}catch{/* Ignore malformed navigation events. */}
  };
  // Register before loading Cloudflare: Navigation API callbacks can run before
  // location.hash changes, so checking the current address alone is too late.
  navigation?.addEventListener('navigate',beforeNavigation);
  syncCloudflareBeacon();window.addEventListener('hashchange',syncCloudflareBeacon);window.addEventListener('storage',syncCloudflareBeacon);window.addEventListener('altwing:analytics-consent',syncCloudflareBeacon);
  return()=>{navigation?.removeEventListener('navigate',beforeNavigation);window.removeEventListener('hashchange',syncCloudflareBeacon);window.removeEventListener('storage',syncCloudflareBeacon);window.removeEventListener('altwing:analytics-consent',syncCloudflareBeacon);};
}
