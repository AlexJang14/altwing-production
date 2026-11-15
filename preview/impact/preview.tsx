import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {ImpactReportView} from '../../src/features/analytics/ImpactDashboard';
import ImpactSurvey from '../../src/features/analytics/ImpactSurvey';
import AnalyticsAccessPanel from '../../src/features/analytics/AnalyticsAccessPanel';
import type {ImpactReport} from '../../src/features/analytics/impactTypes';
import '../../src/features/analytics/analytics.css';
import './preview.css';
const zero={sessions:0,page_views:0,mission_starts:0,mission_completions:0,wingmatch_starts:0,wingmatch_completions:0,wingmatch_conversions:0};
const sample:ImpactReport={
  demo:true,generatedAt:'2026-11-14T20:00:00.000Z',range:{from:'2026-11-12',to:'2026-11-14',allTime:true},
  coverage:{activatedAt:'2026-11-12T00:00:00.000Z',earliestAvailable:'2026-11-12T00:00:00.000Z',note:'DEMO fixtures only. These numbers illustrate the interface and are not real AltWing statistics or evidence for an application.'},
  totals:{sessions:12,page_views:32,mission_starts:10,mission_completions:5,wingmatch_starts:8,wingmatch_completions:5,wingmatch_conversions:5},
  lifetime:{sessions:12,page_views:32,mission_starts:10,mission_completions:5,wingmatch_starts:8,wingmatch_completions:5,wingmatch_conversions:5},
  daily:[{day:'2026-11-12',sessions:4,page_views:10,mission_starts:5,mission_completions:2,wingmatch_starts:4,wingmatch_completions:2,wingmatch_conversions:2},{day:'2026-11-13',sessions:5,page_views:14,mission_starts:3,mission_completions:2,wingmatch_starts:2,wingmatch_completions:2,wingmatch_conversions:2},{day:'2026-11-14',sessions:3,page_views:8,mission_starts:2,mission_completions:1,wingmatch_starts:2,wingmatch_completions:1,wingmatch_conversions:1}],
  surveys:{responses:4,respondentSessions:4,paired:3,satisfaction:4.25,helpfulness:4.5,recommendation:8.5,before:7/3,after:4,change:5/3,legacyResponses:0},
  distributions:[{metric:'satisfaction',rating:4,responses:3},{metric:'satisfaction',rating:5,responses:1},{metric:'helpfulness',rating:4,responses:2},{metric:'helpfulness',rating:5,responses:2},{metric:'recommendation',rating:8,responses:2},{metric:'recommendation',rating:9,responses:2},{metric:'understanding_after',rating:4,responses:3},{metric:'understanding_after',rating:5,responses:1}],
  feedback:[{id:'demo-permitted',source:'wingmatch',createdAt:'2026-11-14T12:00:00Z',text:'DEMO: Comparing projects helped me decide what I would like to explore next.',quotePermission:true},{id:'demo-private',source:'wingmatch',createdAt:'2026-11-13T12:00:00Z',text:'DEMO PRIVATE FEEDBACK: I would like clearer instructions in the next activity.',quotePermission:false}],
  caveats:['DEMO FIXTURES — these are not real production statistics. Do not use demo exports as impact evidence.','Anonymous visit sessions are not unique individuals.','Optional respondents do not represent all visitors or verified unique students.','Before/after changes are paired self-reports, not proof of learning or causation.','Lifetime production coverage begins with available retained history and activation; deleted older events cannot be reconstructed.','The printable report excludes unpermitted testimonials. Review permitted quotes for identifying details.','Cloudflare site/performance metrics remain separate from AltWing hash-route and educational metrics.'],
};
export function Preview(){
 const [tab,setTab]=useState<'dashboard'|'survey'|'access'>('access'),[empty,setEmpty]=useState(false);
 const [account,setAccount]=useState<'owner'|'additional'|'anonymous'|'unlisted'>('additional');
 const report=empty?{...sample,totals:zero,lifetime:zero,daily:[],feedback:[],distributions:[],surveys:{responses:0,respondentSessions:0,paired:0,satisfaction:null,helpfulness:null,recommendation:null,before:null,after:null,change:null,legacyResponses:0}}:sample;
 return <>
  <header className="impact-preview-nav">
   <a href="#" onClick={e=>e.preventDefault()}><span className="preview-wing">✦</span> AltWing <small>Approval preview</small></a>
   <nav><button onClick={()=>setTab('access')} aria-pressed={tab==='access'}>Access states</button><button onClick={()=>setTab('dashboard')} aria-pressed={tab==='dashboard'}>Administrator dashboard</button><button onClick={()=>setTab('survey')} aria-pressed={tab==='survey'}>Student feedback</button></nav>
   <p>This standalone file uses the actual React components. No production data, tracking, authentication or submissions are connected.</p>
  </header>
  <main className="aw-analytics-page">{tab==='access'?<section className="impact-header">
   <div className="impact-demo">DEMO AUTHORIZATION STATES · No real login, administrator identities or production data</div>
   <span className="aw-eyebrow">DUAL-ADMINISTRATOR APPROVAL PREVIEW</span><h1>Independent sign-in.<br/>The same protected insights.</h1>
   <p>The existing administrator keeps access. An additional approved account can sign in separately. These controls switch demo views only; production permissions are checked on the server.</p>
   <div className="impact-scope" aria-label="Choose a demonstration access state">
    <button type="button" aria-pressed={account==='owner'} onClick={()=>setAccount('owner')}>Existing administrator · demo</button>
    <button type="button" aria-pressed={account==='additional'} onClick={()=>setAccount('additional')}>Additional administrator · demo</button>
    <button type="button" aria-pressed={account==='anonymous'} onClick={()=>setAccount('anonymous')}>Signed out · demo</button>
    <button type="button" aria-pressed={account==='unlisted'} onClick={()=>setAccount('unlisted')}>Unlisted account · demo</button>
   </div>
   <p role="status">Expected API authorization: {account==='anonymous'?'401 · sign-in required':account==='unlisted'?'403 · account not authorized':'200 · authorized administrator'}. All displayed report values are demo fixtures.</p>
   {account==='anonymous'||account==='unlisted'?<AnalyticsAccessPanel status={account==='anonymous'?'login':'forbidden'} preview/>:<ImpactReportView key={account} report={sample}/>}
  </section>:tab==='dashboard'?<section className="impact-header"><span className="aw-eyebrow">PREVIEW · ADMINISTRATOR VIEW IN PRODUCTION</span><h1>Educational impact,<br/>with the context it needs.</h1><p>Try chart controls, accessible data, CSV downloads, quote permissions and print/PDF. All output is marked as a demo.</p><div className="impact-scope"><button onClick={()=>setEmpty(false)} aria-pressed={!empty}>Demo sample period</button><button onClick={()=>setEmpty(true)} aria-pressed={empty}>Empty-state preview</button></div><ImpactReportView key={String(empty)} report={report}/></section>:<section><div className="impact-demo">PREVIEW ONLY · No answers will be sent or stored</div><h1>Optional feedback after WingMatch</h1><p>The optional before rating is collected at the start of the real WingMatch flow. This preview supplies a clearly simulated before rating of 2/5.</p><ImpactSurvey before={2} demo/></section>}</main>
 </>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
