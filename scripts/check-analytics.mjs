import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
const nativeRequire=createRequire(import.meta.url),sqlite=new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync('drizzle/0000_reflective_shockwave.sql','utf8'));
sqlite.exec(fs.readFileSync('drizzle/0001_impact_measurement.sql','utf8'));
let authHeaders=new Headers();
const env={ANALYTICS_ADMIN_EMAIL:'owner@example.test',ANALYTICS_INGEST_SECRET:'test-only-ingestion-secret',DB:{
 prepare(sql){return {sql,args:[],bind(...args){this.args=args;return this;},async run(){const result=sqlite.prepare(this.sql).run(...this.args);return {meta:{changes:result.changes}};},async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}};},
 async batch(statements){return Promise.all(statements.map(s=>s.all()));},
}};
const cache=new Map();
function load(file){const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;const module={exports:{}};cache.set(absolute,module);
 const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const require=name=>name==='cloudflare:workers'?{env}:name==='next/headers'?{headers:async()=>authHeaders}:name==='next/navigation'?{redirect(){throw Error('Unexpected redirect');}}:name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)+'.ts'):nativeRequire(name);
 new Function('require','module','exports',output)(require,module,module.exports);return module.exports;}
const model=load('src/features/analytics/analyticsModel.ts');
assert.deepEqual(model.safeProperties({page:'projects',project:'solar',sat:1600,reflection:'PRIVATE',page_label:'PRIVATE',raw_url:'PRIVATE'}),{page:'projects',page_label:'Try Projects',project:'solar'});
assert.equal(model.routeKey('#/projects?project=solar&email=PRIVATE'),model.routeKey('#/projects?project=solar'));
const {validateEvent,reportDays}=load('lib/analytics-validation.ts');
const make=(event='Page Viewed',properties={page:'home'},session_id=crypto.randomUUID())=>({id:crypto.randomUUID(),session_id,event,properties});
assert.equal(validateEvent({...make(),event:'PRIVATE'}),null);assert.equal(validateEvent(make('Page Viewed',{page:'analytics'})),null);assert.equal(validateEvent({...make(),session_id:'bad'}),null);
assert.equal(reportDays('1'),1);assert.equal(reportDays('30'),30);assert.equal(reportDays('DROP TABLE'),7);
const ingest=load('app/api/analytics/events/route.ts');
const {signVisit,verifyVisit}=load('lib/analytics-capability.ts');
const request=async(data,origin='https://altwing.test')=>new Request('https://altwing.test/api/analytics/events',{method:'POST',headers:{origin,'content-type':'application/json','X-AltWing-Visit':await signVisit(data.session_id,env.ANALYTICS_INGEST_SECRET)},body:JSON.stringify(data)});
let payload=make('Page Viewed',{page:'home',sat:1600,reflection:'PRIVATE'});
assert.equal((await ingest.POST(await request(payload,'https://other.test'))).status,403);
assert.equal((await ingest.POST(await request({...payload,properties:{page:'PRIVATE'}}))).status,400);
assert.equal((await ingest.POST(await request({...payload,overflow:'x'.repeat(3000)}))).status,413);
assert.equal((await ingest.POST(await request(payload))).status,202);
assert.equal((await (await ingest.POST(await request(payload))).json()).recorded,false,'Duplicate IDs must not add another event');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM analytics_events').get().n,1);
assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM analytics_events').all()).includes('PRIVATE'));
const sid=payload.session_id;
assert.equal(await verifyVisit(await signVisit(sid,'wrong-secret'),sid,env.ANALYTICS_INGEST_SECRET),false);
assert.equal(await verifyVisit(await signVisit(sid,env.ANALYTICS_INGEST_SECRET,1),sid,env.ANALYTICS_INGEST_SECRET),false);
const unsigned=await request(make());unsigned.headers.delete('X-AltWing-Visit');assert.equal((await ingest.POST(unsigned)).status,403);
await ingest.POST(await request(make('Page Viewed',{page:'explore',from_page:'home'},sid)));
await ingest.POST(await request(make('WingMatch Started',{page:'match'},sid)));
await ingest.POST(await request(make('WingMatch Completed',{page:'match'},sid)));
await ingest.POST(await request(make('Navigation Clicked',{page:'home',to_page:'explore',placement:'header'},sid)));
const report=load('app/api/analytics/report/route.ts'),get=()=>report.GET(new Request('https://altwing.test/api/analytics/report?days=7'));
assert.equal((await get()).status,401,'Anonymous report requests must be denied');
authHeaders=new Headers({'oai-authenticated-user-id':'some-user','oai-authenticated-user-email':'other@example.test'});assert.equal((await get()).status,403,'Signed-in non-owners must be denied');
authHeaders=new Headers({'oai-authenticated-user-id':'owner-id','oai-authenticated-user-email':'OWNER@example.test'});
let response=await get();assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'private, no-store');let result=await response.json();
assert.equal(result.totals.sessions,1);assert.equal(result.totals.page_views,2);assert.equal(result.paths[0].source,'home');assert.equal(result.paths[0].target,'explore');assert.equal(result.matchConversions.completed_started_sessions,1);assert.ok(!JSON.stringify(result).includes(sid),'Reports must not expose anonymous session identifiers');
const old=make();sqlite.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page) VALUES(?,?,?,?,?)').run(old.id,old.session_id,'Page Viewed',Math.floor(Date.now()/1000)-86400*100,'home');
const prune=make();prune.id='0'+prune.id.slice(1);await ingest.POST(await request(prune));assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM analytics_events WHERE id=?').get(old.id).n,0);
const limited=crypto.randomUUID();for(let i=0;i<61;i++)await ingest.POST(await request(make('Page Viewed',{page:'home'},limited)));assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM analytics_events WHERE session_id=?').get(limited).n,60);
// Client behavior: no provider, no setup, first-party only, dedupe and opt-out.
const store=new Map(),session=new Map(),calls=[];
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
globalThis.sessionStorage={getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)};
globalThis.__ALTWING_PRODUCTION_ANALYTICS__=true;globalThis.location={hash:'#/',origin:'https://altwing.org'};globalThis.window={dispatchEvent(){}};
Object.defineProperty(globalThis,'navigator',{value:{doNotTrack:'0',globalPrivacyControl:false},configurable:true});
globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({token:'signed-local-test-token'})};};
const analytics=load('src/features/analytics/analytics.ts');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const eventCalls=()=>calls.filter(c=>c.url==='/api/analytics/events');
analytics.trackPage('#/');analytics.trackPage('#/');analytics.trackPage('#/?email=PRIVATE');await flush();assert.equal(eventCalls().length,1);
assert.equal(eventCalls()[0].options.credentials,'omit');assert.ok(!eventCalls()[0].options.body.includes('PRIVATE'));assert.equal(eventCalls()[0].options.headers['X-AltWing-Visit'],'signed-local-test-token');
location.hash='#/analytics';analytics.trackPage(location.hash);analytics.trackEvent('Project Completed');await flush();assert.equal(eventCalls().length,1);
location.hash='#/match';analytics.setAnalyticsConsent('no');analytics.trackEvent('WingMatch Started');await flush();assert.equal(eventCalls().length,1);
analytics.setAnalyticsConsent('yes');navigator.doNotTrack='1';analytics.trackEvent('WingMatch Started');await flush();assert.equal(eventCalls().length,1);
navigator.doNotTrack='0';navigator.globalPrivacyControl=true;analytics.trackEvent('WingMatch Started');await flush();assert.equal(eventCalls().length,1);
navigator.globalPrivacyControl=false;analytics.trackEvent('WingMatch Started');await flush();assert.equal(eventCalls().length,2);assert.equal(session.has('altwing-analytics-session-v1'),false);
console.log('PASS: actual SQLite migrations/aggregates, signed/expired/invalid visit authorization, origin/size checks, score/text exclusions, ID dedupe, rate limits, retention, anonymous/non-owner denial, owner-only reports, client dedupe and DNT/GPC/opt-out');
// Resumed audit regressions: privacy history boundaries and transient auth recovery.
location.hash='#/home';analytics.trackPage(location.hash);await flush();
analytics.setAnalyticsConsent('no');location.hash='#/projects';analytics.trackPage(location.hash);
analytics.setAnalyticsConsent('yes');location.hash='#/explore';analytics.trackPage(location.hash);await flush();
assert.equal(JSON.parse(eventCalls().at(-1).options.body).properties.from_page,undefined,'Opt-out activity must not be attached after re-enabling');
const validToken=await signVisit(sid,env.ANALYTICS_INGEST_SECRET);
assert.equal(await verifyVisit(validToken+'.extra',sid,env.ANALYTICS_INGEST_SECRET),false,'Reject token suffixes');
const now=Math.floor(Date.now()/1000);assert.equal(await verifyVisit(await signVisit(sid,env.ANALYTICS_INGEST_SECRET,now-3600),sid,env.ANALYTICS_INGEST_SECRET,now),false,'Expiry boundary is expired');
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
// Roll into a fresh session, fail once, and recover on a later interaction.
clock+=31*60*1000;let attempts=0;
globalThis.fetch=async(url,options)=>{calls.push({url,options});if(url.endsWith('/session')){attempts++;return {ok:attempts>1,json:async()=>({token:'recovered-token'})};}return {ok:true,status:202};};
location.hash='#/match';const before=eventCalls().length;analytics.trackEvent('WingMatch Started');await flush();assert.equal(eventCalls().length,before);
clock+=1000;analytics.trackEvent('WingMatch Started');await flush();assert.equal(attempts,1,'A short backoff avoids request storms');
clock+=5001;analytics.trackEvent('WingMatch Started');await flush();assert.equal(attempts,2);assert.equal(eventCalls().length,before+1,'A transient failure must not suppress a whole visit');
let denied=true;
globalThis.fetch=async(url,options)=>{calls.push({url,options});if(url.endsWith('/session')){attempts++;return {ok:true,json:async()=>({token:'fresh-token'})};}return {ok:!denied,status:denied?403:202};};
analytics.trackEvent('WingMatch Started');await flush();const issued=attempts;denied=false;analytics.trackEvent('WingMatch Started');await flush();assert.equal(attempts,issued+1,'Rejected capabilities must refresh on the next action');
clock+=31*60*1000;let releaseCapability;
globalThis.fetch=async(url,options)=>{calls.push({url,options});if(url.endsWith('/session'))return new Promise(resolve=>{releaseCapability=resolve;});return {ok:true,status:202};};
const queuedBefore=eventCalls().length;analytics.trackEvent('WingMatch Started');analytics.setAnalyticsConsent('no');analytics.setAnalyticsConsent('yes');releaseCapability({ok:true,json:async()=>({token:'late-token'})});await flush();assert.equal(eventCalls().length,queuedBefore,'A consent change must discard pending pre-change events');
Date.now=realNow;
console.log('PASS: consent history isolation, exact capability parsing/expiry, transient issuance recovery with backoff, rejected capability refresh');
// GitHub Pages can submit anonymous events; it cannot read private reports cross-origin.
env.ANALYTICS_ALLOWED_ORIGINS='https://junjang06.github.io';
const sessionRoute=load('app/api/analytics/session/route.ts');
const githubOrigin='https://junjang06.github.io';
const preflight=await sessionRoute.OPTIONS(new Request('https://altwing.test/api/analytics/session',{method:'OPTIONS',headers:{Origin:githubOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-altwing-visit'}}));
assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),githubOrigin);assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'),null);
const evil=await sessionRoute.OPTIONS(new Request('https://altwing.test/api/analytics/session',{method:'OPTIONS',headers:{Origin:githubOrigin+'.evil.test'}}));assert.equal(evil.status,403);assert.equal(evil.headers.get('Access-Control-Allow-Origin'),null);
const githubEvent=await ingest.POST(await request(make('Page Viewed',{page:'projects',project:'bridge'}),githubOrigin));assert.equal(githubEvent.status,202);assert.equal(githubEvent.headers.get('Access-Control-Allow-Origin'),githubOrigin);
const privateResponse=await report.GET(new Request('https://altwing.test/api/analytics/report',{headers:{Origin:githubOrigin}}));assert.equal(privateResponse.headers.get('Access-Control-Allow-Origin'),null);
console.log('PASS: exact GitHub Pages CORS allowlist, preflight, anonymous event ingestion, rejected lookalike origins, no cross-origin report exposure');
// Cutover keeps the old origin during transition and permits only exact new origins.
env.ANALYTICS_ALLOWED_ORIGINS='https://junjang06.github.io,https://alexjang14.github.io,https://altwing.org,https://www.altwing.org';
for(const origin of ['https://altwing.org','https://www.altwing.org','https://alexjang14.github.io',githubOrigin]){
 const options=await sessionRoute.OPTIONS(new Request('https://altwing.test/api/analytics/session',{method:'OPTIONS',headers:{Origin:origin}}));
 assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),origin);
 const saved=await ingest.POST(await request(make(),origin));assert.equal(saved.status,202);
 assert.equal(saved.headers.get('Access-Control-Allow-Origin'),origin);
 const privateReport=await report.GET(new Request('https://altwing.test/api/analytics/report',{headers:{Origin:origin}}));
 assert.equal(privateReport.headers.get('Access-Control-Allow-Origin'),null);
}
for(const origin of ['https://altwing.org.evil.test','http://altwing.org','https://altwing.org:444','https://evil-altwing.org','https://alexjang14.github.io.evil.test']){
 const rejected=await sessionRoute.OPTIONS(new Request('https://altwing.test/api/analytics/session',{method:'OPTIONS',headers:{Origin:origin}}));assert.equal(rejected.status,403);
}
location.hash='#/progress-transfer';const transferBefore=calls.length;
analytics.trackPage(location.hash);analytics.trackEvent('Project Completed',{reflection:'PRIVATE'});await flush();
assert.equal(calls.length,transferBefore,'Progress transfer must not emit analytics or issue a visit token');
console.log('PASS: custom-domain CORS, rejected domain lookalikes, private-report isolation and analytics-free progress transfer');
