import {kickSettings} from '../../src/design/kickColorTokens';
/** This bridge exists only in the isolated, anonymous Color Lab artifact. */
export function installColorLabBridge(host:Window & typeof globalThis=window){
 let settings=kickSettings('ion-blue',3),muteUntil=0,scrollFrame=0;
 const tokenNames=['--aw-kick-color','--aw-kick-selected-surface','--aw-kick-orbit-opacity'];
 const apply=()=>{
  const root=host.document.querySelector<HTMLElement>('.aw-theme-black-gold');if(!root)return;
  root.dataset.awKick=settings.palette.id;root.dataset.awKickLevel=String(settings.intensity);
  for(const name of tokenNames){const value=settings.properties[name];if(value)root.style.setProperty(name,value);else root.style.removeProperty(name);}
 };
 const message=(event:MessageEvent)=>{
  if(event.source!==host.parent||!event.data||typeof event.data!=='object')return;
  if(event.data.kind==='altwing-color-lab:theme'){settings=kickSettings(event.data.palette,event.data.intensity);apply();}
  if(event.data.kind==='altwing-color-lab:scroll-to'&&typeof event.data.y==='number'&&Number.isFinite(event.data.y)){muteUntil=host.performance.now()+160;host.scrollTo({top:Math.max(0,event.data.y),behavior:'instant'});}
 };
 host.addEventListener('message',message);
 const observer=new host.MutationObserver(apply);observer.observe(host.document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});apply();
 const scroll=()=>{if(scrollFrame||host.performance.now()<muteUntil)return;scrollFrame=host.requestAnimationFrame(()=>{scrollFrame=0;host.parent.postMessage({kind:'altwing-color-lab:scroll',y:host.scrollY},'*');});};
 host.addEventListener('scroll',scroll,{passive:true});host.parent.postMessage({kind:'altwing-color-lab:ready'},'*');
 return()=>{observer.disconnect();host.removeEventListener('message',message);host.removeEventListener('scroll',scroll);if(scrollFrame)host.cancelAnimationFrame(scrollFrame);};
}
