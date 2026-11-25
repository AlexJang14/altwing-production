import '../../src/styles/application.css';
import {createRoot} from 'react-dom/client';
import {useEffect,useState} from 'react';
import App from '../../src/App';
import {SiteHeader,SiteFooter,PageLoading} from '../../src/components/SiteShell';
import {writeLocal} from '../../src/lib/storage';
import {GOLDEN_SCENES} from './scenes';
import AnalyticsDashboard from '../../src/features/analytics/AnalyticsDashboard';
import AnalyticsAccessPanel from '../../src/features/analytics/AnalyticsAccessPanel';
import {ResearchAssessmentPreview,ResearchDashboardPreview} from '../impact/ResearchPreview';
import {PackReveal} from '../../src/features/progression/CosmicPackVault';
import {CELESTIAL_OBJECTS} from '../../src/features/progression/cosmic';
import PropulsionLab from '../../src/features/wingmatch/build/labs/PropulsionLab';
import GNCLab from '../../src/features/wingmatch/build/labs/GNCLab';
import StructuresLab from '../../src/features/wingmatch/build/labs/StructuresLab';
import ThermalLab from '../../src/features/wingmatch/build/labs/ThermalLab';
import AvionicsLab from '../../src/features/wingmatch/build/labs/AvionicsLab';
import MissionDesignLab from '../../src/features/wingmatch/build/labs/MissionDesignLab';
import './preview.css';
const LABS={propulsion:PropulsionLab,gnc:GNCLab,structures:StructuresLab,thermal:ThermalLab,avionics:AvionicsLab,'mission-design':MissionDesignLab};
const collection={discoveredIds:[],discoverySources:[],stardust:0,history:[]};
const reward={pack:{id:'DEMO-golden-horizon',type:'MISSION' as const,sourceId:'DEMO-only',sourceLabel:'SYNTHETIC PREVIEW',earnedAt:'2026-11-19T12:00:00Z'},collection,cards:['COMMON','RARE','LEGENDARY'].map(rarity=>({object:CELESTIAL_OBJECTS.find(o=>o.rarity===rarity)!,duplicate:false,stardustGain:0,sourceLabel:'SYNTHETIC PREVIEW',collection}))};
export function RewardScene(){const [open,setOpen]=useState(false);return <main className="aw-analytics-page"><h1>A discovery worth keeping.</h1><p>Actual Cosmic Pack component · fixed synthetic cards · no rewards written to production.</p><button className="pack-finish" type="button" onClick={()=>setOpen(true)}>Open demonstration pack</button>{open&&<PackReveal result={reward} onClose={()=>setOpen(false)} onFinish={()=>setOpen(false)}/>}</main>;}
export function Preview(){
 const [selection,setSelection]=useState({id:'home',key:0}),[evidence,setEvidence]=useState('');
 const item=GOLDEN_SCENES.find(s=>s.id===selection.id)??GOLDEN_SCENES[0];
 useEffect(()=>{const listener=(event:MessageEvent)=>{if(event.source!==window.parent||event.data?.kind!=='altwing-golden:scene')return;const next=GOLDEN_SCENES.find(s=>s.id===event.data.id);if(!next)return;
  if(next.id==='match')writeLocal('altwing-match-draft-v1',JSON.stringify({version:1,started:false,questionIndex:0,answers:{},result:null,beforeUnderstanding:null}));
  if('mission' in next)writeLocal('altwing-match-draft-v1',JSON.stringify({version:1,started:true,questionIndex:next.mission,answers:{},result:null,beforeUnderstanding:null}));
  if('route' in next)window.location.hash=next.route;
  setSelection(v=>({id:next.id,key:v.key+1}));setEvidence('');window.scrollTo({top:0,behavior:'instant'});
 };window.addEventListener('message',listener);window.parent.postMessage({kind:'altwing-golden:ready'},'*');return()=>window.removeEventListener('message',listener);},[]);
 useEffect(()=>{const listener=(event:MouseEvent)=>{if(event.defaultPrevented)return;const link=(event.target as Element).closest('a'),href=link?.getAttribute('href'),map:Record<string,string>={'research.html':'#/research','credits.html':'#/credits','terms.html':'#/terms','privacy.html':'#/privacy'};const destination=href?.startsWith('#/')?href:href?map[href]:null;if(destination){event.preventDefault();window.location.hash=destination;if(!('route' in item))setSelection(v=>({id:'home',key:v.key+1}));}};document.addEventListener('click',listener);return()=>document.removeEventListener('click',listener);},[item]);
 let content;
 if('route' in item)content=<App key={selection.key}/>;
 else{const scene='scene' in item?item.scene:'',lab='lab' in item?item.lab:null,Lab=lab?LABS[lab]:null;
  content=<div className="aw-theme-black-gold aw-theme-golden-horizon" data-aw-kick="ion-blue" data-aw-kick-level="3"><SiteHeader view="home" tab="PLAN"/><div className="aw-app-body">
   <p className="gh-demo-label gh-preview-only">SYNTHETIC / OFFLINE PREVIEW · NO PRODUCTION DATA, AUTHENTICATION OR SUBMISSION</p>
   {scene==='dashboard'?<AnalyticsDashboard/>:scene==='research-report'?<main className="aw-analytics-page"><ResearchDashboardPreview/></main>:scene==='assessment'?<main className="aw-analytics-page"><ResearchAssessmentPreview/></main>:scene==='rewards'?<RewardScene/>:scene==='login'?<main className="aw-analytics-page"><h1>Private administrator sign-in</h1><AnalyticsAccessPanel status="login" preview/></main>:scene==='denied'?<main className="gh-access-page"><span>ALTWING / 404</span><h1>This page isn’t available.</h1><p>Return to AltWing to continue exploring.</p><a href="#/">Return to AltWing →</a></main>:scene==='loading'?<PageLoading/>:scene==='error'?<main className="aw-loading"><h1>Let’s reopen this step.</h1><p>The page could not finish loading. Your saved work is still in this browser.</p><a className="aw-button" href="#/">Return home</a></main>:Lab?<main className="be-shell"><div className="be-content"><section className="be-panel"><span className="be-kicker">ACTUAL LAB CONTROLS / {lab}</span><Lab onEvidence={text=>setEvidence(text)}/>{evidence&&<p role="status">Preview evidence captured in memory: {evidence}</p>}</section></div></main>:null}
   <SiteFooter/></div></div>;
 }
 return content;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
