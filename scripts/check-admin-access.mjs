// All identities, feedback and historical records below are synthetic fixtures
// in isolated memory. This test never contacts a production service.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';

const nativeRequire=createRequire(import.meta.url),db=new DatabaseSync(':memory:');
db.exec(fs.readFileSync('drizzle/0000_reflective_shockwave.sql','utf8'));
const now=Math.floor(Date.now()/1000),session=crypto.randomUUID();
for(const [event,page] of [['Page Viewed','home'],['WingMatch Started','match'],['WingMatch Completed','match']]){
  db.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page) VALUES(?,?,?,?,?)').run(crypto.randomUUID(),session,event,now-60,page);
}
const originalHistory=db.prepare('SELECT * FROM analytics_events ORDER BY rowid').all();
for(const sql of fs.readFileSync('drizzle/0001_impact_measurement.sql','utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))db.prepare(sql).run();

for(const sql of fs.readFileSync('drizzle/0002_research_assessment.sql','utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))db.prepare(sql).run();
let identityHeaders=new Headers(),queries=0,workerFrameworkCalls=0;
const env={ANALYTICS_ADMIN_EMAIL:'owner@example.test',ANALYTICS_ADDITIONAL_ADMIN_EMAILS:JSON.stringify(['additional@example.test']),ANALYTICS_INGEST_SECRET:'isolated-admin-test-capability',ANALYTICS_ALLOWED_ORIGINS:'https://altwing.org',DB:{
  prepare(sql){queries++;return {args:[],bind(...args){this.args=args;return this;},async run(){const result=db.prepare(sql).run(...this.args);return {meta:{changes:result.changes}};},async all(){return {results:db.prepare(sql).all(...this.args)};}};},
  async batch(statements){db.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.all());db.exec('COMMIT');return results;}catch(error){db.exec('ROLLBACK');throw error;}},
}};
const cache=new Map();
function load(file){
  const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
  const module={exports:{}};cache.set(absolute,module);
  const source=fs.readFileSync(absolute,'utf8').replaceAll('import.meta.env.DEV','false');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const require=name=>{
    if(name==='cloudflare:workers')return {env};
    if(name==='vinext/server/fetch-handler')return {__esModule:true,default:{fetch(){workerFrameworkCalls++;return new Response('FRAMEWORK RESPONSE FIXTURE');}}};
    if(name==='next/headers')return {headers:async()=>identityHeaders};
    if(name==='next/navigation')return {redirect(location){throw Object.assign(Error('Redirect'),{location});},notFound(){throw Object.assign(Error('Not found'),{status:404});}};
    if(name.endsWith('.css'))return {};
    if(name.startsWith('.')){const resolved=path.resolve(path.dirname(absolute),name);return load(fs.existsSync(resolved)?resolved:fs.existsSync(resolved+'.ts')?resolved+'.ts':resolved+'.tsx');}
    return nativeRequire(name);
  };
  new Function('require','module','exports',output)(require,module,module.exports);return module.exports;
}
function signedIn(email,id='verified-fixture-user'){
  identityHeaders=new Headers({'oai-authenticated-user-id':id,'oai-authenticated-user-email':email});
}
const {analyticsAuthorization}=load('lib/analytics-server.ts');
const analytics=load('app/api/analytics/report/route.ts');
const impact=load('app/api/impact/report/route.ts');
const exportsRoute=load('app/api/impact/export/route.ts');
const initialize=load('app/api/impact/initialize/route.ts');
const routes=[
  ['navigation report',()=>analytics.GET(new Request('https://backend.test/api/analytics/report?days=7'))],
  ['educational impact and private feedback',()=>impact.GET(new Request('https://backend.test/api/impact/report?range=all'))],
  ['all numeric survey rows',()=>exportsRoute.GET(new Request('https://backend.test/api/impact/export?range=all&kind=ratings'))],
  ['all private written feedback',()=>exportsRoute.GET(new Request('https://backend.test/api/impact/export?range=all&kind=feedback'))],
  ['historical initialization',()=>initialize.POST(new Request('https://backend.test/api/impact/initialize',{method:'POST',headers:{Origin:'https://backend.test','Content-Type':'application/json'},body:'{}'}))],
];
for(const version of ['impact-v2','impact-v3']){
 const query='range=all&version='+version;
 routes.push(['research report '+version,()=>load('app/api/impact/assessment-report/route.ts').GET(new Request('https://backend.test/api/impact/assessment-report?'+query))],['private stories '+version,()=>load('app/api/impact/stories/route.ts').GET(new Request('https://backend.test/api/impact/stories?'+query))]);
 for(const kind of ['responses','stories','quotes'])routes.push(['research '+kind+' export '+version,()=>load('app/api/impact/assessment-export/route.ts').GET(new Request('https://backend.test/api/impact/assessment-export?'+query+'&kind='+kind))]);
}
const matrix=[];
async function denied(label,email,expected){
  if(email===null)identityHeaders=new Headers();else signedIn(email);
  const before=queries;
  for(const [name,run] of routes){
    const response=await run();assert.equal(response.status,expected,label+': '+name);
    assert.equal(response.headers.get('Cache-Control'),'private, no-store');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),null);
    const body=await response.text();assert.ok(!body.includes('PRIVATE FIXTURE'));
    assert.ok(!body.includes('owner@example.test')&&!body.includes('additional@example.test'),'Denials must not reveal administrators');
    matrix.push({identity:label,resource:name,status:response.status});
  }
  assert.equal(queries,before,'Denied identities must never query data or run retention/import writes');
}
await denied('anonymous',null,401);
for(const email of ['other@example.test','additional@example.test.evil.test','notadditional@example.test','additional+unlisted@example.test','someone@EXAMPLE.test'])await denied('unlisted account',email,403);
identityHeaders=new Headers({'oai-authenticated-user-email':'additional@example.test'});assert.equal(await analyticsAuthorization(),401,'Email alone is not a signed-in identity');
identityHeaders=new Headers({'oai-authenticated-user-id':'fixture'});assert.equal(await analyticsAuthorization(),401);

const malformed=[undefined,'','not JSON','additional@example.test','owner@example.test,additional@example.test','null','true','123','"additional@example.test"','{}','{"emails":["additional@example.test"]}','[null]','[123]','["additional@example.test",{}]','[""]','["*"]','["*@example.test"]','["additional@*"]','["additional@example.test", "bad"]','x'.repeat(8193),JSON.stringify(Array(101).fill('additional@example.test'))];
for(const value of malformed){
  env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS=value;
  signedIn('OWNER@example.test');assert.equal(await analyticsAuthorization(),200,'Existing owner must survive missing/malformed optional configuration');
  signedIn('additional@example.test');assert.equal(await analyticsAuthorization(),403,'Malformed optional configuration must fail closed');
}
env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS=JSON.stringify([' ADDITIONAL@EXAMPLE.TEST ','additional@example.test']);
signedIn('additional@example.test');assert.equal(await analyticsAuthorization(),200,'Exact normalized additional account is authorized');
env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS='[]';assert.equal(await analyticsAuthorization(),403,'Removing a grant must take effect without a cached authorization');
env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS=JSON.stringify(['additional@example.test','third@example.test']);
for(const email of ['additional@example.test','third@example.test']){signedIn(email);assert.equal(await analyticsAuthorization(),403,'An unexpected third grant fails closed');}
signedIn('owner@example.test');assert.equal(await analyticsAuthorization(),200,'An unexpected optional grant never removes the original owner');
env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS=JSON.stringify(['owner@example.test','additional@example.test']);signedIn('additional@example.test');assert.equal(await analyticsAuthorization(),200,'Owner duplication is not a third account');
const originalOwner=env.ANALYTICS_ADMIN_EMAIL;delete env.ANALYTICS_ADMIN_EMAIL;assert.equal(await analyticsAuthorization(),403,'An additional grant cannot replace the missing original-owner configuration');env.ANALYTICS_ADMIN_EMAIL=originalOwner;
env.ANALYTICS_ADDITIONAL_ADMIN_EMAILS=JSON.stringify(['additional@example.test']);

// No URL, body or ordinary role header can turn an unlisted identity into admin.
signedIn('other@example.test');const beforeForgery=queries;
assert.equal((await impact.GET(new Request('https://backend.test/api/impact/report?range=all&email=owner%40example.test&admin=true',{headers:{'X-Admin-Email':'additional@example.test','X-Role':'owner'}}))).status,403);
assert.equal((await initialize.POST(new Request('https://backend.test/api/impact/initialize',{method:'POST',headers:{Origin:'https://backend.test','Content-Type':'application/json'},body:JSON.stringify({email:'owner@example.test',role:'administrator'})}))).status,403);
assert.equal(queries,beforeForgery);

// The additional administrator can prepare retained history. The original owner
// can resume the same cursor; neither account creates a separate data set.
signedIn('additional@example.test');
assert.equal((await initialize.POST(new Request('https://backend.test/api/impact/initialize',{method:'POST',headers:{Origin:'https://evil.test'}}))).status,403);
assert.equal((await initialize.POST(new Request('https://backend.test/api/impact/initialize',{method:'POST'}))).status,403);
const prepared=await routes[4][1]();assert.equal(prepared.status,200);assert.equal((await prepared.json()).ready,1);
const beforeOwnerResume=db.prepare('SELECT * FROM impact_totals').all();
signedIn('owner@example.test');assert.equal((await routes[4][1]()).status,200);assert.deepEqual(db.prepare('SELECT * FROM impact_totals').all(),beforeOwnerResume);
assert.deepEqual(db.prepare('SELECT id,session_id,event,created_at,page,from_page,to_page,placement,project,major,wing,seconds FROM analytics_events ORDER BY rowid').all(),originalHistory,'Both-account preparation must preserve every original record');

// Store a genuine-handler fixture only in this in-memory database, then prove
// both authorized identities can read its ratings and private text.
identityHeaders=new Headers();
const surveys=load('app/api/impact/surveys/route.ts'),{signVisit}=load('lib/analytics-capability.ts');
const submission={id:crypto.randomUUID(),session_id:session,version:'impact-v1',source:'wingmatch',satisfaction:4,helpfulness:5,recommendation:8,understanding_before:2,understanding_after:4,testimonial:'PRIVATE FIXTURE: local authorization test only.',quote_permission:false,feedback_permission:true};
const anonymousSubmission=new Request('https://backend.test/api/impact/surveys',{method:'POST',headers:{Origin:'https://altwing.org','Content-Type':'application/json','X-AltWing-Visit':await signVisit(session,env.ANALYTICS_INGEST_SECRET)},body:JSON.stringify(submission)});
assert.equal((await load('lib/analytics-access.ts').withAnalyticsAccess(anonymousSubmission,()=>surveys.POST(anonymousSubmission))).status,202,'Anonymous, explicitly consented feedback reaches the real save handler through the Worker boundary');
const saved=db.prepare('SELECT * FROM impact_surveys').all();
let ownerReport;
for(const [label,email] of [['existing owner','OWNER@example.test'],['additional administrator','ADDITIONAL@example.test']]){
  signedIn(email);
  for(const [name,run] of routes){
    const response=await run();assert.equal(response.status,200,label+': '+name);
    assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert.equal(response.headers.get('Access-Control-Allow-Origin'),null);
    const body=await response.text();
    if(name==='navigation report'){assert.equal(JSON.parse(body).totals.page_views,1);assert.ok(!body.includes(session));}
    if(name==='educational impact and private feedback'){
      const report=JSON.parse(body);assert.equal(report.totals.sessions,1);assert.equal(report.surveys.responses,1);assert.equal(report.feedback[0].text,submission.testimonial);assert.equal(report.feedback[0].quotePermission,false);
      if(ownerReport){for(const key of ['totals','lifetime','surveys','feedback','daily'])assert.deepEqual(report[key],ownerReport[key],'Both administrators must see the same preserved data');}else ownerReport=report;
    }
    if(name==='all numeric survey rows'){assert.ok(body.includes('satisfaction'));assert.ok(!body.includes('PRIVATE FIXTURE')&&!body.includes(session));}
    if(name==='all private written feedback')assert.ok(body.includes(submission.testimonial)&&body.includes('PRIVATE FEEDBACK'));
    assert.ok(!body.includes('owner@example.test')&&!body.includes('additional@example.test'),'Reports/exports must not serialize administrator identities');
    matrix.push({identity:label,resource:name,status:response.status});
  }
  assert.deepEqual(db.prepare('SELECT * FROM impact_surveys').all(),saved,'Granting/reporting must preserve feedback and quote permission');
}
await denied('anonymous after initialization',null,401);await denied('unlisted after initialization','other@example.test',403);
const {permittedQuotes}=load('src/features/analytics/impactExports.ts');assert.equal(permittedQuotes(ownerReport).length,0,'An additional administrator does not override public-quote permission');

// Render the real shared access component, not a copy of its implementation.
const AccessPanel=load('src/features/analytics/AnalyticsAccessPanel.tsx').default;
const login=renderToStaticMarkup(createElement(AccessPanel,{status:'login'}));
const forbidden=renderToStaticMarkup(createElement(AccessPanel,{status:'forbidden'}));
assert.ok(login.includes('/signin-with-chatgpt?return_to=%2Fadmin')&&login.includes('target="_top"'));
assert.ok(forbidden.includes('/signout-with-chatgpt?return_to=%2Fadmin%2Flogin')&&forbidden.includes('Administrator access required.'));
assert.ok(!login.includes('account that owns this site')&&!forbidden.includes('does not own the site'));
const demo=renderToStaticMarkup(createElement(AccessPanel,{status:'login',preview:true}));assert.ok(demo.includes('disabled')&&!demo.includes('href='),'Offline preview cannot launch real login');
for(const html of [login,forbidden,demo])assert.ok(!html.includes('@')&&!html.includes('ANALYTICS_ADMIN'));

// Guard the actual Worker request boundary before any framework HTML/RSC/API
// handler, using the same server allowlist as the endpoint-level checks above.
const boundary=load('lib/analytics-access.ts'),boundaryMatrix=[];
const privatePaths=['/admin','/admin/','/admin/reports','/admin?__rsc=fixture','/%61dmin','/admin%2Freports','/api/analytics/report','/api/impact/report','/api/impact/export?kind=feedback','/api/impact/assessment-report?version=impact-v3','/api/impact/stories','/api/impact/assessment-export?kind=stories','/api/impact/initialize','/api/impact/not-yet-created'];
for(const [label,email]of [['anonymous',null],['unlisted','other@example.test'],['original administrator','owner@example.test'],['additional administrator','additional@example.test']]){
 if(email===null)identityHeaders=new Headers();else signedIn(email);
 for(const path of privatePaths){
  const request=new Request('https://backend.test'+path,{headers:identityHeaders}),scope=boundary.analyticsAccessScope(request);let downstream=0;
  const response=await boundary.withAnalyticsAccess(request,()=>{downstream++;return new Response('AUTHORIZED RESPONSE FIXTURE',{headers:{'Cache-Control':'public, max-age=600',ETag:'stale-fixture',Vary:'Accept-Encoding'}});});
  const allowed=email==='owner@example.test'||email==='additional@example.test',expected=allowed?200:scope==='dashboard'?404:email===null?401:403;
  assert.equal(response.status,expected,label+' '+path);assert.equal(downstream,allowed?1:0,'Unauthorized requests never reach server rendering or API handlers');
  assert.equal(response.headers.get('Location'),null,'Private visits must not automatically redirect to login');assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert.equal(response.headers.get('X-Robots-Tag'),'noindex, nofollow');assert.equal(response.headers.get('ETag'),null);assert.ok(response.headers.get('Vary').includes('Cookie'));
  const text=await response.text();if(!allowed){assert.ok(!text.includes('AUTHORIZED RESPONSE FIXTURE')&&!text.includes('signin-with-chatgpt'));assert.ok(!text.includes('example.test'));}
  boundaryMatrix.push({identity:label,path,status:response.status});
 }
}
for(const path of ['/','/admin/login','/admin/login/','/api/analytics/session','/api/analytics/session/','/api/analytics/events','/api/impact/surveys','/api/impact/assessment-events']){
 const request=new Request('https://backend.test'+path);let reached=0;
 const response=await boundary.withAnalyticsAccess(request,()=>{reached++;return new Response('PUBLIC HANDLER',{headers:{'Cache-Control':'public, max-age=5'}});});assert.equal(response.status,200);assert.equal(reached,1,'Public pages, deliberate login and anonymous ingestion remain available');
 if(path.startsWith('/admin/login'))assert.equal(response.headers.get('Cache-Control'),'private, no-store');else assert.equal(response.headers.get('Cache-Control'),'public, max-age=5');
}
const productionWorker=load('worker/index.ts').default;
for(const [path,email,status]of [['/admin',null,404],['/admin','other@example.test',404],['/api/impact/stories',null,401],['/api/impact/stories','other@example.test',403],['/admin','owner@example.test',200],['/admin','additional@example.test',200],['/',null,200],['/api/impact/surveys',null,200]]){
 const headers=email?new Headers({'oai-authenticated-user-id':'worker-fixture','oai-authenticated-user-email':email}):new Headers(),before=workerFrameworkCalls;
 const response=await productionWorker.fetch(new Request('https://backend.test'+path,{headers}),env,{props:{}});assert.equal(response.status,status);assert.equal(workerFrameworkCalls-before,status===200?1:0,'The actual production Worker entry must enforce the guard before the framework');
}
const head=await boundary.withAnalyticsAccess(new Request('https://backend.test/admin',{method:'HEAD'}),()=>{throw Error('Unauthorized HEAD reached the framework');});assert.equal(head.status,404);assert.equal(await head.text(),'');
const AdminPage=load('app/admin/page.tsx').default,LoginPage=load('app/admin/login/page.tsx').default;
for(const email of [null,'other@example.test']){if(email===null)identityHeaders=new Headers();else signedIn(email);const before=queries;await assert.rejects(AdminPage(),error=>error.status===404,'The page independently rejects a bypassed Worker boundary');assert.equal(queries,before);const html=renderToStaticMarkup(await LoginPage());assert.ok(html.includes('Private administrator sign-in'));assert.ok(!html.includes('Impact Stories library')&&!html.includes('PRIVATE FIXTURE'));}
for(const email of ['owner@example.test','additional@example.test']){signedIn(email);const page=await AdminPage();assert.equal(typeof page.type,'function');await assert.rejects(LoginPage(),error=>error.location==='/admin','Only already authorized accounts continue from the login page automatically');}
identityHeaders=new Headers();
const PublicAnalytics=load('src/features/analytics/AnalyticsPage.tsx').default,publicDenial=renderToStaticMarkup(createElement(PublicAnalytics));assert.ok(publicDenial.includes('Access denied'));assert.ok(!publicDenial.includes('signin-with-chatgpt')&&!publicDenial.includes('/admin')&&!publicDenial.includes('Continue to site analytics'));
const publicNav=load('src/components/SiteShell.tsx'),footer=renderToStaticMarkup(createElement(publicNav.SiteFooter)),siteMap=renderToStaticMarkup(createElement(load('src/components/SiteMap.tsx').default));
for(const html of [footer,siteMap])assert.ok(!html.includes('#/analytics')&&!html.includes('/admin')&&!html.includes('signin-with-chatgpt'),'Public navigation does not advertise the dashboard or login');
assert.ok(!fs.readFileSync('src/features/analytics/AnalyticsPage.tsx','utf8').includes('location.replace'),'Legacy hash route cannot launch a redirect or load private dashboard code');assert.ok(fs.readFileSync('worker/index.ts','utf8').includes('return withAnalyticsAccess(request,'),'The request guard must remain wired into the production Worker');
fs.mkdirSync('.sites-runtime/admin-access-validation',{recursive:true});
fs.writeFileSync('.sites-runtime/admin-access-validation/results.json',JSON.stringify({checkedAt:new Date().toISOString(),isolatedInMemoryOnly:true,productionModified:false,malformedConfigurationCases:malformed.length,originalRowsPreserved:originalHistory.length,protectedResourceMatrix:matrix,privateFeedbackPreserved:true,additionalGrantRevocationVerified:true,atMostTwoConfiguredAdministrators:true,workerBoundaryMatrix:boundaryMatrix,protectedDashboardHasServerPageGuard:true,actualWorkerEntryVerified:true,manualSignInOnlyForDeniedVisitors:true,publicNavigationHasNoAdminLinks:true,publicAnonymousFeedbackPreserved:true,actualAccessComponentRendered:true},null,2)+'\n');
console.log(`PASS: ${matrix.length} endpoint and ${boundaryMatrix.length} Worker-boundary protected-resource checks; both administrators share original history, feedback and exports; anonymous/unlisted denial before any database access; ${malformed.length} fail-closed configuration cases without owner lockout; exact matching, revocation, same-origin initialization, quote permissions and actual access-panel rendering. All fixtures stayed in memory.`);
db.close();
