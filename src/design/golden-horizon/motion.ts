/** Presentation only; educational and reward outcomes never depend on motion. */
export function reducedMotion(){return typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
export function preferredScrollBehavior():ScrollBehavior{return reducedMotion()?'auto':'smooth';}
/** Read the shared timing token; reduced motion closes dialogs immediately. */
export function motionDuration(token:string,fallback:number){
  if(reducedMotion())return 0;
  if(typeof document==='undefined'||typeof getComputedStyle!=='function')return fallback;
  const value=getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const parsed=parseFloat(value)*(value.endsWith('ms')?1:1000);
  return Number.isFinite(parsed)&&parsed>=0&&parsed<=1000?parsed:fallback;
}
