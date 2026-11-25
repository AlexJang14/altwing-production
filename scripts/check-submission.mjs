import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const nativeRequire=createRequire(import.meta.url),cache=new Map();
function load(file) {
  const absolute=path.resolve(file);
  if(absolute.endsWith('.json'))return {__esModule:true,default:JSON.parse(fs.readFileSync(absolute,'utf8'))};
  if(cache.has(absolute))return cache.get(absolute).exports;
  const module={exports:{}};cache.set(absolute,module);
  const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const require=(name)=>name.endsWith('/posthog')?{default:{capture(){}},isPostHogConfigured:false}:name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)+(name.endsWith('.json')?'':'.ts')):nativeRequire(name);
  new Function('require','module','exports',output)(require,module,module.exports);
  return module.exports;
}
const catalog=load('src/features/guidance/opportunityCatalog.ts');
const profile={grade:'9',state:'GA',gpa:'',sat:'',act:'',locationPreference:'ANYWHERE',budgetPreference:'ANY',interests:[]};
const results=catalog.rankOpportunities('mechanical',profile);
assert.ok(results.every(x=>x.opportunity.grades.includes('9')),'Grade-ineligible programs must not appear in matching results');
assert.equal(new Set(catalog.GUIDANCE_OPPORTUNITIES.map(x=>x.id)).size,catalog.GUIDANCE_OPPORTUNITIES.length,'Catalog must not duplicate program IDs');
console.log('PASS: grade exclusions and unique opportunity records');
const majors=load('src/features/guidance/engineeringMajors.ts').ENGINEERING_MAJOR_MAP;
for(const major of Object.keys(majors))for(const grade of ['9','10','11','12']) {
  const found=catalog.rankOpportunities(major,{...profile,grade});
  assert.ok(found.every(x=>x.opportunity.grades.includes(grade)),`${major}/${grade}: ineligible grade`);
}
for(const budget of ['FREE_PAID','LOW_COST']) {
  const found=catalog.rankOpportunities('mechanical',{...profile,grade:'11',budgetPreference:budget});
  assert.ok(found.every(x=>budget==='FREE_PAID'?x.opportunity.costBand==='FREE_PAID':['FREE_PAID','UP_TO_500'].includes(x.opportunity.costBand)),'Unknown/high program fees must not pass a strict budget filter');
}
assert.ok(catalog.rankOpportunities('mechanical',{...profile,grade:'11',locationPreference:'NEAR_HOME'}).every(x=>x.opportunity.state==='GA'||x.opportunity.format==='ONLINE'),'Distant hybrid programs must not be called near home');
const route=load('src/lib/routes.ts');
assert.equal(route.parseRoute('#/counselor?major=civil&tab=COLLEGES').tab,'COLLEGES');
assert.equal(route.parseRoute('#/counselor?major=invalid&tab=WRONG').major,null);
assert.equal(route.parseRoute('#/aerospace-build?wing=bad').wing,'propulsion');
assert.equal(route.parseRoute('#/projects?project=solar').project,'solar');
const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class {constructor(type){this.type=type;}};
const storage=load('src/features/guidance/guidanceStorage.ts');
assert.equal(storage.readStudentProfile().grade,'','New visitors must not receive an invented grade');
assert.equal(storage.readStudentProfile().state,'','New visitors must not receive an invented state');
store.set('altwing-guidance-profile-v1','{"grade":"999","interests":null}');
assert.deepEqual(storage.readStudentProfile().interests,[]);
store.set('altwing-guidance-selected-major-v1','invalid');assert.equal(storage.readSelectedMajor(),null);
store.set('altwing-guidance-saved-v1','{"collegeIds":null,"ideaIds":"oops"}');assert.deepEqual(storage.readSavedGuidance(),{collegeIds:[],opportunityIds:[],ideaIds:[]});
const model=load('src/features/projects/projectModel.ts');
assert.equal(model.simulate('solar',0),240);assert.ok(model.simulate('solar',60)<model.simulate('solar',0));
assert.ok(model.simulate('cooling',.20)<model.simulate('cooling',.02));
assert.ok(model.simulate('bridge',2)<model.simulate('bridge',1));
for(const project of model.PROJECTS){
  const draft=model.newDraft(project);
  assert.equal(model.isComplete(draft),false);
  const full={...draft,stage:5,prediction:'My prediction',comparison:'My comparison',revision:'My evidence-based revision',reflection:'My limitation and next question',runs:[{input:project.min,output:model.simulate(project.id,project.min),at:'2026-10-25T20:00:00Z'},{input:project.max,output:model.simulate(project.id,project.max),at:'2026-10-25T20:01:00Z'}],updatedAt:'2026-10-25T20:01:00Z'};
  assert.equal(model.isComplete(full),true);
  model.saveDraft(project,full);assert.deepEqual(model.readDraft(project),full,'Full project must round-trip across storage');
  assert.ok(model.evidenceText(project,full).includes('SIMULATED TESTS'));
  assert.ok(model.evidenceText(project,full).includes('My limitation and next question'));
  assert.equal(model.isComplete({...full,runs:[full.runs[0],full.runs[0]]}),false,'A revision needs a different tested input');
}
const local=load('src/lib/storage.ts');
globalThis.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
assert.equal(local.writeLocal('test-resilience','preserved'),false);assert.equal(local.readLocal('test-resilience'),'preserved');assert.equal(local.isMemoryOnly(),true);
console.log('PASS: 14-major × 4-grade eligibility, budget/location exclusions, routes, profile validation, 3 project models, completion gates, draft round-trips, export content, and blocked storage recovery');
const colleges=load('src/features/guidance/collegeCatalog.ts');
assert.equal(colleges.BASE_GUIDANCE_COLLEGES.length,663,'Preserve the original reviewed college baseline');
assert.ok(colleges.GUIDANCE_COLLEGES.length>=663,'Retain every original college while allowing reviewed new records');
assert.ok(colleges.BASE_GUIDANCE_COLLEGES.every(base=>colleges.GUIDANCE_COLLEGES.some(current=>current.id===base.id)),'Original saved college IDs must remain available');
assert.equal(new Set(colleges.GUIDANCE_COLLEGES.map(c=>c.id)).size,colleges.GUIDANCE_COLLEGES.length,'No duplicate university IDs');
const directory=colleges.GUIDANCE_COLLEGES.filter(c=>c.majorCoverage==='ENGINEERING_GENERAL');
const baseDirectory=colleges.BASE_GUIDANCE_COLLEGES.filter(c=>c.majorCoverage==='ENGINEERING_GENERAL');
assert.equal(baseDirectory.length,626);assert.ok(baseDirectory.every(c=>c.engineeringMajors.length===0&&c.sourceYear.includes('2025')&&c.sourceUrl),'Preserve explicit historical baseline context');
assert.ok(directory.every(c=>c.sourceYear&&c.sourceUrl),'Live directory entries require explicit provenance/cohort context');
const snapshot=JSON.parse(fs.readFileSync('content/intelligence/published.json','utf8'));
for(const college of directory)if(college.engineeringMajors.length){const record=snapshot.records.find(r=>r.id==='college:'+college.id);assert.ok(record?.verification.verified_fields.includes('program_information'),'An exact-major claim requires reviewed program evidence');}
assert.equal(catalog.BASE_GUIDANCE_OPPORTUNITIES.length,42);
assert.ok(catalog.BASE_GUIDANCE_OPPORTUNITIES.every(base=>catalog.GUIDANCE_OPPORTUNITIES.some(current=>current.id===base.id)),'Original saved opportunity IDs must remain available');
for(const major of Object.keys(majors))for(const grade of ['9','10','11','12'])assert.ok(catalog.rankOpportunities(major,{...profile,grade}).every(x=>!x.opportunity.needsGradeCheck),'Grade-unknown programs must not pass a selected-grade filter');
const recommendations=load('src/features/projects/projectRecommendations.ts');
assert.equal(recommendations.recommendProjects([{majorId:'civil'}])[0].project.id,'bridge');
assert.equal(recommendations.recommendProjects([{majorId:'electrical'}])[0].project.id,'solar');
assert.equal(recommendations.recommendProjects([{majorId:'mechanical'}])[0].project.id,'cooling');
for(const major of Object.keys(majors))assert.equal(new Set(recommendations.recommendProjects([{majorId:major}]).map(x=>x.project.id)).size,3);
console.log(`PASS: ${colleges.GUIDANCE_COLLEGES.length} unique universities and ${catalog.GUIDANCE_OPPORTUNITIES.length} programs; all 663/42 baseline IDs preserved, honest snapshot coverage, grade-unknown exclusions, and recommendations for all 14 directions`);

// Navigation compatibility and one-time reward transactions.
for (const view of ['sitemap','major','colleges','programs']) assert.equal(route.parseRoute(route.routeTo(view,{major:'civil'})).view,view);
assert.equal(route.parseRoute('#/colleges?tab=PLAN').tab,'COLLEGES');
assert.equal(route.parseRoute('#/programs?tab=COLLEGES').tab,'OPPORTUNITIES');
assert.equal(route.parseRoute('#/major?major=civil').major,'civil');
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
const packs=load('src/features/progression/cosmic-packs.ts');
const cosmic=load('src/features/progression/cosmic.ts');
const award=packs.awardCosmicPack('qa:completed-project','BUILDER','Completed project');
assert.equal(award.awarded,true);
assert.equal(packs.awardCosmicPack('qa:completed-project','BUILDER','Completed project').awarded,false,'Repeated saves must not issue duplicate packs');
const opened=packs.openCosmicPack(award.pack.id);
assert.equal(opened.cards.length,3);
assert.ok(opened.cards.every(card=>cosmic.CELESTIAL_OBJECTS.some(object=>object.id===card.object.id)));
assert.ok(opened.cards.every(card=>cosmic.readCosmicCollection().discoveredIds.includes(card.object.id)),'Every reveal must persist in the collection');
assert.equal(packs.openCosmicPack(award.pack.id),null,'Opening the same pack twice must not duplicate rewards');
assert.ok(packs.readCosmicPackInventory().packs.find(pack=>pack.id===award.pack.id).openedAt);
console.log('PASS: canonical and legacy navigation, single pack award per project, three persisted discoveries, and one-time opening');

// Regression: high scores must not give every above-range college the same sort weight.
const scoreProfile={...profile,state:'',gpa:'',sat:'',act:'',locationPreference:'ANYWHERE'};
const lowSat=colleges.rankColleges('aerospace',{...scoreProfile,sat:'1100'});
const highSat=colleges.rankColleges('aerospace',{...scoreProfile,sat:'1600'});
const gatech=colleges.GUIDANCE_COLLEGES.find(c=>c.id==='gatech');
const embry=colleges.GUIDANCE_COLLEGES.find(c=>c.name.includes('Embry-Riddle'));
assert.ok(gatech && embry);
const position=(list,id)=>list.findIndex(item=>item.college.id===id);
assert.ok(position(lowSat,embry.id)<position(lowSat,gatech.id),'1100 should place the closer Embry-Riddle profile before Georgia Tech');
assert.ok(position(highSat,gatech.id)<position(highSat,embry.id),'1600 should bring the higher published Georgia Tech profile forward');
const lowAct=colleges.rankColleges('aerospace',{...scoreProfile,act:'24'});
const highAct=colleges.rankColleges('aerospace',{...scoreProfile,act:'36'});
assert.ok(position(lowAct,embry.id)<position(lowAct,gatech.id));
assert.ok(position(highAct,gatech.id)<position(highAct,embry.id));
const bothLowAct=colleges.getCollegeAcademicFit(gatech,{...scoreProfile,sat:'1450',act:'20'});
const bothHighAct=colleges.getCollegeAcademicFit(gatech,{...scoreProfile,sat:'1450',act:'36'});
assert.equal(bothHighAct.comparisons.length,2,'SAT must not hide an entered ACT score');
assert.ok(bothHighAct.value>bothLowAct.value,'Changing ACT must affect score fit even when SAT is filled');
assert.equal(colleges.getCollegeAcademicFit(gatech,{...scoreProfile,sat:'1000',act:'36'}).atOrAboveTestRange,false,'The within/above filter must check both comparable tests');
assert.equal(colleges.getCollegeAcademicFit(gatech,{...scoreProfile,sat:'1600',act:'36'}).atOrAboveTestRange,true);
const noData={...gatech,sat25:null,sat50:null,sat75:null,act25:null,act50:null,act75:null,averageGpa:'No comparable 4.0 average reported'};
assert.equal(colleges.getCollegeAcademicFit(noData,{...scoreProfile,sat:'1600',act:'36',gpa:'3.9'}).value,null,'Missing data must not invent a fit score');
assert.equal(colleges.getCollegeAcademicFit(noData,{...scoreProfile,gpa:'3.9'}).value,null,'A 4.0 scale reference must not become a GPA statistic');
assert.equal(colleges.getCollegeAcademicFit({...gatech,testingPolicy:'NOT_USED'},{...scoreProfile,sat:'1600',act:'36'}).value,null,'Test-free colleges must not be ranked by test scores');
assert.equal(colleges.getCollegeAcademicFit({...noData,averageGpa:'3.90–4.00 unweighted middle 50%'},{...scoreProfile,gpa:'3.95'}).value,100);
assert.equal(colleges.readAcademicScores({...scoreProfile,sat:'400',act:'1'}).sat,400);
assert.equal(colleges.readAcademicScores({...scoreProfile,sat:'1600',act:'36'}).act,36);
for(const sat of ['399','1601','1505','NaN'])assert.ok(Number.isNaN(colleges.readAcademicScores({...scoreProfile,sat}).sat));
for(const act of ['0','37','30.5','NaN'])assert.ok(Number.isNaN(colleges.readAcademicScores({...scoreProfile,act}).act));
assert.deepEqual(colleges.rankColleges('aerospace',scoreProfile).map(x=>x.college.id),colleges.rankColleges('aerospace',{...scoreProfile,sat:'2000',act:'99'}).map(x=>x.college.id),'Invalid scores must not alter ordering');
assert.deepEqual(colleges.rankColleges('aerospace',{...scoreProfile,sat:'1100'},'MAJOR_LOCATION').map(x=>x.college.id),colleges.rankColleges('aerospace',{...scoreProfile,sat:'1600'},'MAJOR_LOCATION').map(x=>x.college.id),'The explicit major/location sort must stay independent of test scores');
assert.equal(highSat.length,lowSat.length,'Changing scores must not silently remove colleges');
assert.ok(colleges.rankColleges('aerospace',{...scoreProfile,sat:'1600',state:'FL',locationPreference:'NEAR_HOME'})[0].college.state==='FL','Explicit home-state preference remains respected');
console.log('PASS: SAT/ACT score-sensitive ordering, both-test influence, missing/test-free/GPA handling, boundaries, filters, and preserved university coverage');
console.log('SAT 1100 first six:',lowSat.slice(0,6).map(item=>item.college.shortName).join(' | '));
console.log('SAT 1600 first six:',highSat.slice(0,6).map(item=>item.college.shortName).join(' | '));

const combined=colleges.rankColleges('aerospace',{...scoreProfile,sat:'1600',act:'36'});
assert.equal(combined[0].academicFit.comparisons.length,2,'Both entered tests available must precede partial-data comparisons');
let partialSeen=false;
for(const item of combined){if(item.academicFit.comparisons.length<2)partialSeen=true;else assert.equal(partialSeen,false,'Partial score data must not outrank complete score comparisons');}
console.log('PASS: complete SAT + ACT profiles precede partial data; missing test basis stays explicit');
