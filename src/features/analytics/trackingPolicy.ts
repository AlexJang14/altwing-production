import {readLocal} from '../../lib/storage';
declare const __ALTWING_PRODUCTION_ANALYTICS__: boolean | undefined;
export function productionTrackingAllowed(){
  return typeof __ALTWING_PRODUCTION_ANALYTICS__==='boolean'&&__ALTWING_PRODUCTION_ANALYTICS__&&typeof location!=='undefined'&&location.origin==='https://altwing.org';
}
export function browserPrivacyBlocked(){return navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl===true;}
export function usageTrackingAllowed(){return productionTrackingAllowed()&&readLocal('altwing-analytics-consent-v1')!=='no'&&!browserPrivacyBlocked();}
export function privateAnalyticsRoute(hash:string){return /^#\/?(?:analytics|privacy|progress-transfer)(?:\?|$)/.test(hash);}
