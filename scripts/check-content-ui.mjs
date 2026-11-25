import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),base=JSON.parse(fs.readFileSync('content/intelligence/published.json','utf8')),health=JSON.parse(fs.readFileSync('content/intelligence/health.json','utf8'));
function modules(snapshot=base,sourceHealth=health){
 const cache=new Map();
 function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('/content/intelligence/published.json'))return {__esModule:true,default:snapshot};
  if(file.endsWith('/content/intelligence/health.json'))return {__esModule:true,default:sourceHealth};
  if(file.endsWith('.json'))return {__esModule:true,default:JSON.parse(fs.readFileSync(file,'utf8'))};
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  new Function('require','module','exports',out)(name=>{
   if(!name.startsWith('.'))return require(name);
   const absolute=path.resolve(path.dirname(file),name),resolved=[absolute,absolute+'.ts',absolute+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
   if(!resolved)throw Error('Test import missing: '+name);return load(resolved);
  },mod,mod.exports);return mod.exports;
 }
 return {load,intelligence:load('src/content/intelligence.ts')};
}
const results=[];
function test(id,fn){fn();results.push({id,status:'PASS'});console.log('PASS '+id);}
const fixture=structuredClone(base);for(const r of fixture.records){r.display={};r.imported_legacy=true;r.last_changed_at=null;r.verification={status:'legacy_reviewed',last_verified_at:null,verified_fields:[],evidence:[]};}const fixtureOpportunity=fixture.records.find(r=>r.id==='opportunity:gtri-2027');fixtureOpportunity.verification.last_verified_at='2026-11-15T00:00:00Z';
const initial=modules(fixture),now=new Date('2026-11-24T00:00:00Z');
const opportunities=initial.load('src/features/guidance/opportunityCatalog.ts'),colleges=initial.load('src/features/guidance/collegeCatalog.ts');
test('CONTENT-UI-PRESERVED-CATALOG-AND-SAVED-IDS',()=>{
 assert.equal(opportunities.BASE_GUIDANCE_OPPORTUNITIES.length,42);assert.equal(colleges.BASE_GUIDANCE_COLLEGES.length,663);
 const live=modules(),liveOpportunities=live.load('src/features/guidance/opportunityCatalog.ts'),liveColleges=live.load('src/features/guidance/collegeCatalog.ts');
 for(const [all,originals,prefix] of [[liveOpportunities.GUIDANCE_OPPORTUNITIES,opportunities.BASE_GUIDANCE_OPPORTUNITIES,'opportunity:'],[liveColleges.GUIDANCE_COLLEGES,colleges.BASE_GUIDANCE_COLLEGES,'college:']]){assert.equal(new Set(all.map(x=>x.id)).size,all.length);for(const original of originals){const patch=base.records.find(r=>r.id===prefix+original.id)?.display??{};assert.deepEqual(all.find(x=>x.id===original.id),{...original,...patch,id:original.id});}}
 assert.deepEqual(opportunities.GUIDANCE_OPPORTUNITIES,opportunities.BASE_GUIDANCE_OPPORTUNITIES);
 assert.deepEqual(colleges.GUIDANCE_COLLEGES,colleges.BASE_GUIDANCE_COLLEGES);
});
test('CONTENT-UI-IMPORTED-NOT-NEW-NOR-VERIFIED-TODAY',()=>{
 for(const row of fixture.records){if(!row.legacy_id||!['college','internship','research','summer_program','competition'].includes(row.kind))continue;
  const info=initial.intelligence.freshness(row.kind==='college'?'college':'opportunity',row.legacy_id,now);
  assert.ok(!info.labels.includes('New this week'));assert.ok(!info.labels.includes('Recently updated'));
 }
 assert.equal(initial.intelligence.freshness('college','scorecard-100654',now).lastVerified,null);
});
const original=fixture.records.find(r=>r.id==='opportunity:gtri-2027'),record=structuredClone(original);
record.verification.verified_fields=['deadline','application_cycle'];record.facts.deadline='2026-11-24';record.facts.application_cycle='2026';
test('CONTENT-UI-DATE-ONLY-AND-INSTANT-BOUNDARIES',()=>{
 const fn=initial.intelligence.contentStatus;
 for(const [at,expected] of [['2026-11-10T23:59:59Z','closing_soon'],['2026-11-24T12:00:00Z','closing_soon'],['2026-11-25T12:00:00Z','closing_soon'],['2026-11-26T00:00:01Z','archived']])assert.equal(fn(record,new Date(at)),expected,at);
 record.facts.deadline='2026-11-24T18:00:00Z';assert.equal(fn(record,new Date('2026-11-24T18:00:01Z')),'archived');
});
test('CONTENT-UI-UNKNOWN-CYCLE-IS-NOT-CLAIMED-OPEN',()=>{
 const r=structuredClone(original);assert.equal(initial.intelligence.contentStatus(r,now),'cycle_unverified');
 r.facts.source_status='next_cycle_pending';assert.equal(initial.intelligence.contentStatus(r,now),'cycle_unverified');r.verification.verified_fields=['source_status'];assert.equal(initial.intelligence.contentStatus(r,now),'next_cycle_pending');
});
test('CONTENT-UI-FAILED-SOURCE-HAS-RETAINED-FACTS-LABEL',()=>{
 const h={...health,sources:{fixture:{record_id:original.id,status:'incomplete'}}};
 assert.ok(modules(fixture,h).intelligence.freshness('opportunity',original.legacy_id,now).labels.some(x=>x.includes('Source unavailable')));
 h.snapshot_id='other-snapshot';assert.ok(!modules(fixture,h).intelligence.freshness('opportunity',original.legacy_id,now).labels.some(x=>x.includes('Source unavailable')));
});
test('CONTENT-UI-FAILED-LINK-IS-VISIBLE-WITHOUT-ADVANCING-VERIFICATION',()=>{
 const h={...health,sources:{fixture:{record_id:original.id,status:'ok',link_failure:'HTTP 404'}}};
 const info=modules(fixture,h).intelligence.freshness('opportunity',original.legacy_id,now);assert.ok(info.labels.some(x=>x.includes('Source unavailable')));assert.equal(info.lastVerified,original.verification.last_verified_at.slice(0,10));
});
test('CONTENT-UI-ARCHIVE-FILTER-RETAINS-SAVED-RECORD',()=>{
 const snapshot=structuredClone(fixture),r=snapshot.records.find(x=>x.id===original.id);r.facts.deadline='2000-01-01';r.verification.verified_fields=['deadline'];
 const m=modules(snapshot),catalog=m.load('src/features/guidance/opportunityCatalog.ts');
 assert.ok(catalog.GUIDANCE_OPPORTUNITIES.some(x=>x.id===original.legacy_id));
 assert.equal(catalog.GUIDANCE_OPPORTUNITIES.find(x=>x.id===original.legacy_id).status,'WATCH','An archived cycle must not retain an OPEN badge');
 const major='mechanical',profile={grade:'',state:'',gpa:'',sat:'',act:'',locationPreference:'ANYWHERE',budgetPreference:'ANY',interests:[]};
 assert.ok(!catalog.rankOpportunities(major,profile).some(x=>x.opportunity.id===original.legacy_id));
 assert.ok(catalog.rankOpportunities(major,profile,true).some(x=>x.opportunity.id===original.legacy_id));
});
test('CONTENT-UI-REVIEWED-ADDITIONS-PRESERVE-SAFE-UNKNOWNS',()=>{
 const snapshot=structuredClone(fixture),r=structuredClone(original);r.id='opportunity:reviewed-new';r.legacy_id='reviewed-new';r.imported_legacy=false;r.facts.grades=null;r.facts.cost=null;r.display={};r.verification.status='partially_verified';r.verification.verified_fields=['name'];snapshot.records.push(r);
 const catalog=modules(snapshot).load('src/features/guidance/opportunityCatalog.ts');const added=catalog.GUIDANCE_OPPORTUNITIES.find(x=>x.id==='reviewed-new');assert.ok(added.needsGradeCheck);assert.deepEqual(added.grades,[]);assert.equal(added.costBand,'UNKNOWN');
 const profile={grade:'10',state:'',gpa:'',sat:'',act:'',locationPreference:'ANYWHERE',budgetPreference:'ANY',interests:[]};assert.ok(!catalog.rankOpportunities('mechanical',profile).some(x=>x.opportunity.id==='reviewed-new'));
});
test('CONTENT-UI-ACTUAL-COMPONENT-RENDERS-TRUTHFUL-SOURCE-NOTICE',()=>{
 const component=initial.load('src/components/ContentFreshness.tsx').default,React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const html=renderToStaticMarkup(React.createElement(component,{kind:'opportunity',id:original.legacy_id}));assert.match(html,/Prior source review/);assert.match(html,/Official source/);assert.match(html,/Check current cycle/);assert.ok(!html.includes('New this week'));
});
console.log(JSON.stringify({environment:'Node + TypeScript CommonJS loader and React server rendering; not browser execution',results},null,2));
