import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
const nativeRequire=createRequire(import.meta.url);
function loader(){const cache=new Map();function load(file){const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;const module={exports:{}};cache.set(absolute,module);const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const require=name=>name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)+'.ts'):nativeRequire(name);new Function('require','module','exports',output)(require,module,module.exports);return module.exports;}return load;}
function setup({origin='https://altwing.org',build=true,consent='yes',dnt='0',gpc=false,hash='#/'}={}){
 const store=new Map([['altwing-analytics-consent-v1',consent]]),session=new Map(),scripts=[],sent=[];
 globalThis.__ALTWING_PRODUCTION_ANALYTICS__=build;
 globalThis.location={origin,hash,search:'',get href(){return this.origin+'/'+this.search+this.hash;}};
 globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
 globalThis.sessionStorage={getItem:key=>session.get(key)??null,setItem:(key,value)=>session.set(key,value),removeItem:key=>session.delete(key)};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{doNotTrack:dnt,globalPrivacyControl:gpc,sendBeacon:(url,data)=>{sent.push({kind:'beacon',url,data});return true;}}});
 globalThis.XMLHttpRequest=class {open(method,url){this.url=url;}send(data){sent.push({kind:'xhr',url:this.url,data});}abort(){this.aborted=true;}};
 globalThis.window=Object.assign(new EventTarget(),{fetch:async(input,options)=>{sent.push({kind:'fetch',url:String(input),options});return new Response(null,{status:204});}});
 globalThis.fetch=async(url,options)=>{sent.push({kind:'api',url,options});return {ok:true,status:202,json:async()=>url.endsWith('/session')?{token:'test-capability'}:{accepted:true}};};
 globalThis.document={querySelector:()=>scripts[0]??null,createElement:()=>({setAttribute(key,value){this[key]=value;}}),body:{appendChild:script=>scripts.push(script)}};
 return {store,scripts,sent,load:loader()};
}
for(const options of [{build:false},{origin:'http://localhost:5173'},{origin:'https://alexjang14.github.io'},{origin:'https://altwing-engineering-pathways.theanna.chatgpt.site'},{consent:'no'},{dnt:'1'},{gpc:true},{hash:'#/privacy'},{hash:'#/analytics'},{hash:'#/progress-transfer'},{hash:'#/unknown-private-value'},{hash:'#/projects?project=solar&email=private'}]){
 const context=setup(options);context.load('src/features/analytics/cloudflareBeacon.ts').startCloudflareBeacon();assert.equal(context.scripts.length,0,JSON.stringify(options));assert.equal(context.sent.length,0);
}
let context=setup(),cloudflare=context.load('src/features/analytics/cloudflareBeacon.ts');
cloudflare.startCloudflareBeacon();cloudflare.startCloudflareBeacon();cloudflare.syncCloudflareBeacon();
assert.equal(context.scripts.length,1);assert.equal(context.scripts[0].type,'module');assert.equal(context.scripts[0].src,'https://static.cloudflareinsights.com/beacon.min.js');assert.equal(JSON.parse(context.scripts[0]['data-cf-beacon']).token,'6d42f06f4b9f490988f46600a83380e8');
location.hash='#/projects?project=solar';window.dispatchEvent(new Event('hashchange'));assert.equal(context.scripts.length,1,'Never reinject on hash navigation');
navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum','data');assert.equal(context.sent.length,1);
const analytics=context.load('src/features/analytics/analytics.ts');
analytics.setAnalyticsConsent('no');
assert.equal(navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum','blocked'),false);
await window.fetch('https://cloudflareinsights.com/cdn-cgi/rum',{method:'POST'});
const xhr=new XMLHttpRequest();xhr.open('POST','https://cloudflareinsights.com/cdn-cgi/rum');xhr.send('blocked');assert.equal(xhr.aborted,true);
assert.equal(context.sent.length,1,'Revocation must block requests from an already-loaded beacon');
await window.fetch('https://backend.test/project');assert.equal(context.sent.length,2,'Unrelated application requests stay intact');
analytics.setAnalyticsConsent('yes');assert.equal(navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum','queued'),false,'Cloudflare stays disarmed for this document to avoid replaying private/opted-out activity');assert.equal(context.scripts.length,1);
context=setup();window.navigation=new EventTarget();context.load('src/features/analytics/cloudflareBeacon.ts').startCloudflareBeacon();
const navigating=new Event('navigate');Object.defineProperty(navigating,'destination',{value:{url:'https://altwing.org/#/progress-transfer'}});window.navigation.dispatchEvent(navigating);
assert.equal(navigator.sendBeacon('https://cloudflareinsights.com/cdn-cgi/rum','early private navigation'),false,'Block private Navigation API destinations before location.hash is updated');assert.equal(context.sent.length,0);
context=setup();const client=context.load('src/features/analytics/analytics.ts');
client.trackPage('#/');client.trackPage('#/');await new Promise(resolve=>setImmediate(resolve));assert.equal(context.sent.filter(c=>c.url==='/api/analytics/events').length,1,'StrictMode/hash normalization must not duplicate page events');
location.hash='#/projects?project=solar';client.trackEvent('Mission Started',{project:'solar'});client.trackEvent('Mission Started',{project:'solar'});await new Promise(resolve=>setImmediate(resolve));assert.equal(context.sent.filter(c=>c.url==='/api/analytics/events').length,2);
client.setAnalyticsConsent('yes');context.store.set('altwing-analytics-consent-v1','no');const storage=new Event('storage');Object.defineProperty(storage,'key',{value:'altwing-analytics-consent-v1'});window.dispatchEvent(storage);assert.equal(client.analyticsEnabled(),false,'Cross-tab opt-out invalidates cached preferences');
const before=context.sent.length;client.trackEvent('Project Completed');await new Promise(resolve=>setImmediate(resolve));assert.equal(context.sent.length,before);
const submission={id:crypto.randomUUID(),version:'impact-v1',source:'site',satisfaction:4,helpfulness:4,recommendation:8,understanding_before:null,understanding_after:4,testimonial:'',quote_permission:false,feedback_permission:true};
await client.submitImpactFeedback(submission);assert.equal(context.sent.filter(c=>c.url==='/api/impact/surveys').length,1,'Separately consented voluntary feedback is distinct from automatic usage metrics');assert.equal(context.sent.filter(c=>c.url==='/api/analytics/events').length,2);
context=setup({build:false});const preview=context.load('src/features/analytics/analytics.ts');preview.trackPage('#/');await assert.rejects(()=>preview.submitImpactFeedback(submission),/disabled/);assert.equal(context.sent.length,0);
console.log('PASS: exact supplied Cloudflare module snippet, canonical production-only loading, one script across StrictMode/hash routes, DNT/GPC and cross-tab opt-out, post-load sendBeacon/XHR/fetch revocation, private/query-route suppression, unaffected app requests, first-party navigation/mission dedup, explicit-feedback consent separation and preview exclusion');
