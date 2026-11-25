import {useEffect,type RefObject} from 'react';
/** Presentation only: content stays visible when scripting/motion APIs are unavailable. */
export function useVisualEntrance(ref:RefObject<HTMLElement|null>){
 useEffect(()=>{
  const root=ref.current;if(!root||typeof IntersectionObserver==='undefined'||!root.animate)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');if(preference.matches)return;
  const style=getComputedStyle(root),duration=parseFloat(style.getPropertyValue('--aw-motion-enter'))||540,easing=style.getPropertyValue('--aw-motion-ease').trim()||'ease-out';
  const animations=new Set<Animation>();
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const animation=(entry.target as HTMLElement).animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration,easing});animations.add(animation);void animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});observer.unobserve(entry.target);}},{threshold:.08});
  root.querySelectorAll('[data-aw-reveal]').forEach(el=>observer.observe(el));
  const reduce=()=>{if(preference.matches){observer.disconnect();animations.forEach(a=>a.cancel());}};preference.addEventListener('change',reduce);
  return()=>{observer.disconnect();animations.forEach(a=>a.cancel());preference.removeEventListener('change',reduce);};
 },[ref]);
}
