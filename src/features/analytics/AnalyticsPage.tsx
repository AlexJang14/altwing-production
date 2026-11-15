import { analyticsBackendOrigin } from './analyticsEndpoint';
import { useEffect, useState } from 'react';
import { downloadText } from '../../lib/storage';
import { PAGE_LABELS } from './analyticsModel';
import './analytics.css';
import ImpactDashboard from './ImpactDashboard';
import AnalyticsAccessPanel from './AnalyticsAccessPanel';
type Report={days:number;since:number;updatedAt:string;totals:{events:number;sessions:number;page_views:number;navigation_clicks:number};daily:{day:string;sessions:number;views:number}[];pages:{page:string;views:number;sessions:number}[];paths:{source:string;target:string;count:number}[];milestones:{event:string;sessions:number;count:number}[];placements:{placement:string;clicks:number}[];lastPages:{page:string;sessions:number}[];matchConversions:{completed_started_sessions:number}};
const pageName=(page:string)=>PAGE_LABELS[page]??page;
const labels:Record<string,string>={'WingMatch Started':'Started WingMatch','WingMatch Completed':'Completed WingMatch','Project Test Run':'Ran a project test','Project Completed':'Saved a completed project'};
function AnalyticsDashboard(){
  const [days,setDays]=useState(7),[report,setReport]=useState<Report|null>(null),[status,setStatus]=useState('loading'),[refresh,setRefresh]=useState(0);
  useEffect(()=>{
    let active=true,controller:AbortController|null=null;
    async function load(){controller?.abort();controller=new AbortController();
      try{const response=await fetch('/api/analytics/report?days='+days,{cache:'no-store',credentials:'same-origin',signal:controller.signal});if(!active)return;
        if(response.status===401 || response.status===403){setReport(null);setStatus(response.status===401?'login':'forbidden');return;}
        if(!response.ok)throw Error('Report unavailable');const data=await response.json() as Report;if(active){setReport(data);setStatus('ready');}
      }catch(error){if(active && !(error instanceof DOMException && error.name==='AbortError'))setStatus('error');}
    }
    void load();const timer=setInterval(()=>{if(!document.hidden)void load();},30000);
    return()=>{active=false;controller?.abort();clearInterval(timer);};
  },[days,refresh]);
  const data=report?.days===days?report:null;
  const started=data?.milestones.find(m=>m.event==='WingMatch Started')?.sessions??0;
  const completed=data?.matchConversions.completed_started_sessions??0;
  const reportDay=data?Math.floor(Date.parse(data.updatedAt)/86400000):0;
  const daily=Array.from({length:days},(_,i)=>{const day=new Date((reportDay-(days-1-i))*86400000).toISOString().slice(0,10);return data?.daily.find(d=>d.day===day)??{day,sessions:0,views:0};});
  const maxDaily=Math.max(1,...daily.map(d=>d.views));
  return <main className="aw-analytics-page"><section className="aw-analytics-intro"><span className="aw-eyebrow">ALTWING · ADMINISTRATOR DASHBOARD</span><h1>Understand the journey.</h1><p>See where students begin, what they explore, and which steps they take next.</p></section>
    {(status==='login'||status==='forbidden')?<AnalyticsAccessPanel status={status}/>:<>
    <ImpactDashboard/><h2 style={{marginTop:48}}>Original navigation report</h2><p>Retained raw events from the last 90 days, including legacy hosting origins. The educational impact section above excludes new preview/legacy-origin traffic and explains its historical coverage.</p>
    <div className="aw-analytics-toolbar"><label>Reporting period <select value={days} onChange={e=>{setDays(Number(e.target.value));setStatus('loading');}}><option value={1}>Today · UTC</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select></label><div><button type="button" onClick={()=>{setStatus('loading');setRefresh(r=>r+1);}}>Refresh</button><button type="button" disabled={!data || status!=='ready'} onClick={()=>downloadText('altwing-site-analytics.json',JSON.stringify(data,null,2),'application/json')}>Download report ↓</button></div></div>
    <p className="aw-analytics-updated" role="status">{status==='loading'?'Loading site statistics…':status==='error'?'Statistics could not be refreshed. Try again.':data?'Live server data · updated '+new Date(data.updatedAt).toLocaleTimeString()+' · refreshes every 30 seconds':''}</p>
    {data&&<><section className="aw-analytics-stats" aria-label="Site statistics"><article><span>Visit sessions</span><strong>{data.totals.sessions??0}</strong><small>Anonymous sessions, across browsers</small></article><article><span>Page views</span><strong>{data.totals.page_views??0}</strong><small>Recorded page openings</small></article><article><span>Pages per session</span><strong>{data.totals.sessions?((data.totals.page_views??0)/data.totals.sessions).toFixed(1):'0'}</strong><small>Average depth of exploration</small></article><article><span>Navigation clicks</span><strong>{data.totals.navigation_clicks??0}</strong><small>Links in menus and page content</small></article></section>
    {!data.totals.events&&<section className="aw-analytics-panel"><h2>Ready for the first journey.</h2><p>There are no recorded visits in this period yet. Student-page visits will appear here automatically. This dashboard does not count its own views.</p><a href="#/">Visit AltWing →</a></section>}
    <div className="aw-analytics-columns"><section className="aw-analytics-panel"><span className="aw-eyebrow">ACTIVITY OVER TIME</span><h2>Daily page views</h2><div className="aw-analytics-chart" role="img" aria-label={daily.map(d=>d.day+': '+d.views+' page views').join('; ')}>{daily.map(d=><div key={d.day} title={d.day+': '+d.views+' views / '+d.sessions+' sessions'}><span>{d.views}</span><i style={{height:(d.views/maxDaily*135)+'px'}}/><small>{d.day.slice(5)}</small></div>)}</div><p>Calendar days in UTC. Only recorded traffic is included.</p></section><section className="aw-analytics-panel"><span className="aw-eyebrow">WHERE STUDENTS SPEND TIME</span><h2>Most visited pages</h2>{data.pages.length?<ol className="aw-analytics-rank">{data.pages.slice(0,7).map(p=><li key={p.page}><div><strong>{pageName(p.page)}</strong><span>{p.views} views · {p.sessions} sessions</span></div><i style={{width:Math.max(1,p.views/data.pages[0].views*100)+'%'}}/></li>)}</ol>:<p>No page views in this period.</p>}</section></div>
    <section className="aw-analytics-panel"><div className="aw-analytics-section-heading"><div><span className="aw-eyebrow">FOLLOW THE MOVEMENT</span><h2>Most common paths</h2></div><span>Recorded page-to-page transitions</span></div>{data.paths.length?<div className="aw-analytics-flow">{data.paths.slice(0,10).map(p=><article key={p.source+'-'+p.target}><span>{pageName(p.source)}</span><b aria-label="to">→</b><span>{pageName(p.target)}</span><strong>{p.count}<small>transitions</small></strong></article>)}</div>:<p>Paths appear when a session visits more than one student page.</p>}</section>
    <div className="aw-analytics-columns"><section className="aw-analytics-panel"><span className="aw-eyebrow">FROM CURIOSITY TO ACTION</span><h2>Learning milestones</h2><ul className="aw-analytics-milestones">{Object.entries(labels).map(([event,label])=><li key={event}><span>{label}</span><strong>{data.milestones.find(m=>m.event===event)?.sessions??0}<small>sessions</small></strong></li>)}</ul><p>{started?`${completed} of ${started} sessions that started WingMatch also completed it in this period (${Math.round(completed/started*100)}%).`:'WingMatch completion rate appears after a session starts the activity.'} Milestones count sessions independently; students can explore in any order.</p></section><section className="aw-analytics-panel"><span className="aw-eyebrow">WHERE JOURNEYS PAUSE</span><h2>Last pages visited</h2><p>The most recent page in sessions with no recorded page view for at least 30 minutes. A pause can mean the student is still working.</p>{data.lastPages.length?<ul className="aw-analytics-paths">{data.lastPages.map(p=><li key={p.page}><span>{pageName(p.page)}</span><b>{p.sessions} sessions</b></li>)}</ul>:<p>No inactive sessions to show yet.</p>}<h3>Navigation clicks by location</h3><ul className="aw-analytics-paths">{data.placements.map(p=><li key={p.placement}><span>{p.placement==='header'?'Main menu':p.placement==='footer'?'Footer':p.placement==='journey'?'Step shortcuts':'Page content'}</span><b>{p.clicks}</b></li>)}</ul></section></div>
    <section className="aw-analytics-footnote"><p>Statistics combine anonymous sessions from visitors who allow collection. One session is a browser tab visit that resets after 30 minutes of inactivity; it is not a verified individual. Blocked tracking is not counted. Scores and written work are excluded. Raw records are pruned after 90 days as traffic arrives. <a href="#/privacy">Privacy details →</a></p><a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out</a></section></>}
    </>}
  </main>;
}

function ExternalAnalytics(){
  useEffect(()=>{window.location.replace(analyticsBackendOrigin+'/#/analytics');},[]);
  return <main className="aw-analytics-page" role="status"><h1>Opening your site analytics.</h1><p>Your protected dashboard is hosted on the AltWing server.</p><a href={analyticsBackendOrigin+'/#/analytics'}>Continue to site analytics →</a></main>;
}
export default function AnalyticsPage(){return analyticsBackendOrigin?<ExternalAnalytics/>:<AnalyticsDashboard/>;}
