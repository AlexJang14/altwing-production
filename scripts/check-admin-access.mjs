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

let identityHeaders=new Headers(),queries=0;
const env={ANALYTICS_ADMIN_EMAIL:'owner@example.test',ANALYTICS_ADDITIONAL_ADMIN_EMAILS:JSON.stringify(['additional@example.test']),ANALYTICS_INGEST_SECRET:'isolated-admin-test-capability',ANALYTICS_ALLOWED_ORIGINS:'https://altwing.org',DB:{
  prepare(sql){queries++;return {args:[],bind(...args){this.args=args;return this;},async run(){const result=db.prepare(sql).run(...this.args);return {meta:{changes:result.changes}};},async all(){return {results:db.prepare(sql).all(...this.args)};}};},
  async batch(statements){db.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.all());db.exec('COMMIT');return results;}catch(error){db.exec('ROLLBACK');throw error;}},
}};
const cache=new Map();
function load(file){
  const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
  const module={exports:{}};cache.set(absolute,module);
  const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const require=name=>{
    if(name==='cloudflare:workers')return {env};
    if(name==='next/headers')return {headers:async()=>identityHeaders};
    if(name==='next/navigation')return {redirect(){throw Error('Unexpected redirect');}};
    if(name.startsWith('.')){const resolved=path.resolve(path.dirname(absolute),name);return load(fs.existsSync(resolved+'.ts')?resolved+'.ts':resolved+'.tsx');}
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
assert.equal((await surveys.POST(new Request('https://backend.test/api/impact/surveys',{method:'POST',headers:{Origin:'https://altwing.org','Content-Type':'application/json','X-AltWing-Visit':await signVisit(session,env.ANALYTICS_INGEST_SECRET)},body:JSON.stringify(submission)}))).status,202);
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
assert.ok(login.includes('/signin-with-chatgpt?return_to=%2F%23%2Fanalytics')&&login.includes('target="_top"'));
assert.ok(forbidden.includes('/signout-with-chatgpt?return_to=%2F%23%2Fanalytics')&&forbidden.includes('Administrator access required.'));
assert.ok(!login.includes('account that owns this site')&&!forbidden.includes('does not own the site'));
const demo=renderToStaticMarkup(createElement(AccessPanel,{status:'login',preview:true}));assert.ok(demo.includes('disabled')&&!demo.includes('href='),'Offline preview cannot launch real login');
for(const html of [login,forbidden,demo])assert.ok(!html.includes('@')&&!html.includes('ANALYTICS_ADMIN'));

fs.mkdirSync('.sites-runtime/admin-access-validation',{recursive:true});
fs.writeFileSync('.sites-runtime/admin-access-validation/results.json',JSON.stringify({checkedAt:new Date().toISOString(),isolatedInMemoryOnly:true,productionModified:false,malformedConfigurationCases:malformed.length,originalRowsPreserved:originalHistory.length,protectedResourceMatrix:matrix,privateFeedbackPreserved:true,additionalGrantRevocationVerified:true,actualAccessComponentRendered:true},null,2)+'\n');
console.log(`PASS: ${matrix.length} protected-resource checks; both administrators share original history, feedback and exports; anonymous/unlisted denial before any database access; ${malformed.length} fail-closed configuration cases without owner lockout; exact matching, revocation, same-origin initialization, quote permissions and actual access-panel rendering. All fixtures stayed in memory.`);
db.close();
