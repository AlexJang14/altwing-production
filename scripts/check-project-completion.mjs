// Actual project component handlers and reward storage, with synthetic in-memory
// browser data. No network, production database, or real student records.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
const nativeRequire=createRequire(import.meta.url),cache=new Map(),store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key),key:index=>[...store.keys()][index]??null,get length(){return store.size;}};
globalThis.window=new EventTarget();
const events=[],awards=[],awardSignals=[];window.addEventListener('altwing:cosmic-pack-awarded',e=>awardSignals.push(e.detail));
let slots=[],cursor=0,clock=Date.parse('2026-11-25T02:00:00Z');
class FixtureDate extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
const hooks={useEffect(){},useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];}};
const SurveyMarker=()=>null;
function load(file){
 const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
 if(absolute.endsWith('.json'))return {__esModule:true,default:JSON.parse(fs.readFileSync(absolute,'utf8'))};
 const module={exports:{}};cache.set(absolute,module);
 const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const require=name=>{
  if(name==='react')return hooks;
  if(name.endsWith('/analytics/analytics'))return {trackEvent:(event,properties)=>events.push({event,properties})};
  if(name.endsWith('/analytics/ImpactSurvey'))return {__esModule:true,default:SurveyMarker};
  if(name.endsWith('/posthog'))return {__esModule:true,default:{capture(){}},isPostHogConfigured:false};
  if(name.endsWith('/progression/cosmic-packs')){const actual=load('src/features/progression/cosmic-packs.ts');return {...actual,awardCosmicPack(...args){const result=actual.awardCosmicPack(...args);awards.push({args,awarded:result.awarded});return result;}};}
  if(name.endsWith('.css'))return {};
  if(name.startsWith('.')){const base=path.resolve(path.dirname(absolute),name);return load(fs.existsSync(base)?base:fs.existsSync(base+'.ts')?base+'.ts':base+'.tsx');}
  return nativeRequire(name);
 };
 new Function('require','module','exports','Date',code)(require,module,module.exports,FixtureDate);return module.exports;
}
const model=load('src/features/projects/projectModel.ts'),Projects=load('src/features/projects/Projects.tsx').default,packs=load('src/features/progression/cosmic-packs.ts');
function nodes(tree){if(!tree||typeof tree!=='object')return [];if(Array.isArray(tree))return tree.flatMap(nodes);return [tree,...nodes(tree.props?.children)];}
function text(tree){if(tree==null||typeof tree==='boolean')return '';if(Array.isArray(tree))return tree.map(text).join('');if(typeof tree!=='object')return String(tree);return text(tree.props?.children);}
const results=[];
for(const project of model.PROJECTS){
 const completed=()=>model.readDraft(project),countEvents=()=>events.filter(e=>['Mission Completed','Project Completed'].includes(e.event)&&e.properties.project===project.id).length;
 const seed={...model.newDraft(project),stage:5,prediction:'SYNTHETIC prediction',comparison:'SYNTHETIC comparison',revision:'SYNTHETIC revision',reflection:'SYNTHETIC reflection',runs:[{input:project.min,output:model.simulate(project.id,project.min),at:new FixtureDate().toISOString()},{input:project.max,output:model.simulate(project.id,project.max),at:new FixtureDate().toISOString()}]};
 model.saveDraft(project,{...seed,reflection:''});slots=[];
 const render=()=>{cursor=0;return Projects({projectId:project.id});};
 const save=tree=>nodes(tree).find(n=>n.type==='button'&&text(n)==='Save my exploration record');
 const context=tree=>nodes(tree).find(n=>n.type===SurveyMarker)?.props.contextKey;
 let tree=render();assert.equal(save(tree).props.disabled,true);save(tree).props.onClick();assert.equal(countEvents(),0);assert.equal(completed().completedAt,undefined);
 model.saveDraft(project,seed);slots=[];tree=render();const initial=save(tree).props.onClick;const beforeAwards=awards.length;
 initial();const first=completed();assert.ok(first.completedAt);assert.equal(countEvents(),2);assert.equal(awards.length,beforeAwards+1);assert.equal(awards.at(-1).awarded,true);
 // Same captured handler twice before React re-renders must still be idempotent.
 initial();assert.deepEqual(completed(),first);assert.equal(countEvents(),2);assert.equal(awards.length,beforeAwards+1);
 tree=render();const firstContext=context(tree),firstInventory=JSON.stringify(packs.readCosmicPackInventory()),firstSignals=awardSignals.length;
 clock+=60000;save(tree).props.onClick();assert.deepEqual(completed(),first);assert.equal(context(render()),firstContext);assert.equal(countEvents(),2);assert.equal(JSON.stringify(packs.readCosmicPackInventory()),firstInventory);assert.equal(awardSignals.length,firstSignals);
 // A real refresh/remount must read the saved completion and retain its context.
 slots=[];tree=render();assert.equal(context(tree),firstContext);save(tree).props.onClick();assert.deepEqual(completed(),first);assert.equal(countEvents(),2);assert.equal(awards.length,beforeAwards+1);
 // Navigation/support changes and same-value input are not a new learning cycle.
 nodes(tree).find(n=>n.type==='select').props.onChange({target:{value:'hints'}});tree=render();nodes(tree).find(n=>n.type==='textarea').props.onChange({target:{value:seed.reflection}});tree=render();assert.equal(completed().completedAt,first.completedAt);save(tree).props.onClick();assert.equal(context(render()),firstContext);assert.equal(countEvents(),2);
 // Changed evidence invalidates completion, survives a refresh, and can be saved
 // as a new completion once. The original per-project reward remains one-time.
 nodes(tree).find(n=>n.type==='textarea').props.onChange({target:{value:seed.reflection+' — revised after another comparison'}});tree=render();assert.equal(completed().completedAt,undefined);assert.equal(context(tree),undefined);slots=[];tree=render();clock+=60000;save(tree).props.onClick();const revised=completed();assert.ok(revised.completedAt);assert.notEqual(revised.completedAt,first.completedAt);assert.equal(countEvents(),4);assert.equal(awards.length,beforeAwards+2);assert.equal(awards.at(-1).awarded,false);assert.equal(JSON.stringify(packs.readCosmicPackInventory()),firstInventory);assert.equal(awardSignals.length,firstSignals);const revisedContext=context(render());assert.notEqual(revisedContext,firstContext);
 clock+=60000;save(render()).props.onClick();assert.deepEqual(completed(),revised);assert.equal(context(render()),revisedContext);assert.equal(countEvents(),4);assert.equal(awards.length,beforeAwards+2);
 results.push({project:project.id,invalidSaveBlocked:true,firstSave:true,rapidRepeatIdempotent:true,repeatTimestampAndContextPreserved:true,refreshPreserved:true,metadataAndNoopEditPreserved:true,editedRecompletion:true,oneRewardPerProject:true});
}
fs.mkdirSync('.sites-runtime/project-completion-validation',{recursive:true});fs.writeFileSync('.sites-runtime/project-completion-validation/results.json',JSON.stringify({checkedAt:new Date().toISOString(),isolatedInMemoryOnly:true,productionModified:false,actualComponentHandlers:true,actualRewardStorage:true,results},null,2)+'\n');
console.log('PASS: actual project handlers for all3 projects — initial/invalid/rapid/repeat saves, refresh, stable assessment context, real reward deduplication, and edited re-completion. Synthetic in-memory data only.');
