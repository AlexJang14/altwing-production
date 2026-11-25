import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import ts from 'typescript';
import postcss from 'postcss';
import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const native=createRequire(import.meta.url),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),hash=s=>createHash('sha256').update(s).digest('hex');
const read=p=>fs.readFileSync(p,'utf8'),baseline=JSON.parse(read('.sites-runtime/golden-horizon-baseline.json'));
const styleMap=JSON.parse(read('docs/design/GOLDEN-HORIZON-STYLE-MAP.json'));
// Only UI/motion adapters are allowed to differ from the copied candidate.
function normalizeUi(source,file){
 source=source.replace(/^import \{(?:preferredScrollBehavior|reducedMotion)\} from '[^']*golden-horizon\/motion';\n/gm,'').replace(/behavior:\s*(?:preferredScrollBehavior\(\)|["']smooth["'])/g,'behavior: "smooth"');
 if(file==='src/App.tsx')source=source.replace('className="aw-theme-black-gold aw-theme-golden-horizon" data-aw-kick="ion-blue" data-aw-kick-level="5"',"className={route.view==='home'?'aw-theme-black-gold':undefined}");
 if(file==='src/features/analytics/ImpactDashboard.tsx')source=source.replace("color:'var(--gh-gold)'","color:'#b4efd0'").replace('<title>{`${row.day}: ${row.total}`}</title>','<title>{row.day}: {row.total}</title>');
 if(file==='src/features/progression/CosmicPackVault.tsx')source=source.replace('setRevealCount(reducedMotion() ? result.cards.length : 0);\n    if(reducedMotion())return;','setRevealCount(0);');
 return source.replace(/\s+/g,' ').trim();
}
let exactLogicFiles=0,uiLogicFiles=0,previousFiles=0;
const currentModel=[];
for(const row of baseline.sourceFiles){const original=path.join(baseline.sourceWorkspace,row.path);assert.equal(sha(original),row.sha256,'Previous Color Lab source changed: '+row.path);previousFiles++;
 if(/^(?:app\/(?:api|admin)\/|lib\/|db\/|drizzle\/|worker\/|deployment\/(?:domain|analytics-runtime)|src\/lib\/|src\/features\/)/.test(row.path)&&!row.path.endsWith('.css')){
  const actual=sha(row.path);if(actual===row.sha256)exactLogicFiles++;else{assert.ok(row.path.endsWith('.tsx'),'Non-UI logic/data must be byte-identical: '+row.path);assert.equal(normalizeUi(read(row.path),row.path),normalizeUi(read(original),row.path),'Educational, storage or authorization logic changed: '+row.path);uiLogicFiles++;}
  currentModel.push({path:row.path,sha256:actual,presentationOnlyDifference:actual!==row.sha256});
 }
 if(/^docs\/(?:rights|release-readiness)\//.test(row.path))assert.equal(sha(row.path),row.sha256,'Existing rights/release evidence must be retained: '+row.path);
}
for(const file of ['public/brand/altwing-penguin.png','src/assets/black-gold/orbital-horizon.webp','src/assets/black-gold/fonts/manrope-latin.woff2','src/assets/black-gold/fonts/spacegrotesk-latin.woff2'])assert.equal(sha(file),baseline.sourceFiles.find(r=>r.path===file).sha256,'Existing visual assets must be preserved');
// Scientific/rarity/print rules and semantic condition colors are independent.
const parsed=new Map();function rules(file){if(!parsed.has(file)){const list=[];postcss.parse(read(file)).walkRules(r=>list.push(r));parsed.set(file,list);}return parsed.get(file);}
for(const row of styleMap.protectedRules)assert.ok(rules(row.file).some(r=>r.selector===row.selector&&hash(r.toString())===row.sha256),'Protected visual/print rule changed: '+row.file+' '+row.selector);
for(const row of styleMap.preservedSemanticColors){const rule=rules(row.file)[row.ruleIndex];assert.equal(rule.selector,row.selector);for(const expected of row.declarations)assert.ok(rule.nodes.some(d=>d.type==='decl'&&d.prop===expected.property&&d.value===expected.value&&!!d.important===expected.important),'Semantic condition color changed: '+row.selector);}
for(const row of styleMap.files){assert.equal(sha(row.file),row.afterSha256,'Style-map evidence stale: '+row.file);assert.ok(read(row.file).includes('var(--gh-'),'UI styles must consume central tokens: '+row.file);}
const tokens=read('src/design/golden-horizon/tokens.css'),platform=read('src/design/golden-horizon/platform.css');
for(const color of ['#101216','#1B1E24','#E6BB65','#F7F2E6','#45D9FF'])assert.ok(tokens.includes(color));
assert.ok(read('src/App.tsx').includes('data-aw-kick-level="5"')&&!read('src/App.tsx').includes("route.view==='home'?'aw-theme"));
assert.ok(read('src/main.tsx').includes('golden-horizon/platform.css')&&read('app/layout.tsx').includes('golden-horizon/platform.css'));
assert.ok(platform.includes('prefers-reduced-motion:reduce')&&platform.includes('--gh-dialog-layer')&&platform.includes('.research-distribution i')&&platform.includes('.aw-analytics-chart i'));
const nativeReact={...React,useSyncExternalStore:(_subscribe,getSnapshot)=>getSnapshot()};
const storage=()=>{const m=new Map();return {get length(){return m.size;},getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>[...m.keys()][i]??null};};
const host={localStorage:storage(),sessionStorage:storage(),location:{hash:'#/',origin:'https://preview.invalid'},addEventListener(){},removeEventListener(){},dispatchEvent(){},matchMedia:()=>({matches:false}),scrollTo(){}};
const documentStub={body:{},getElementById(){return null;},querySelector(){return null;}};
function loader(overrides={}){const cache=new Map();function load(file){const abs=path.resolve(file);if(cache.has(abs))return cache.get(abs).exports;const module={exports:{}};cache.set(abs,module);const code=ts.transpileModule(read(abs),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const require=name=>{if(name==='react')return nativeReact;if(name==='react-dom')return {...native('react-dom'),createPortal:child=>child};if(name.endsWith('.css'))return {};if(/\.(png|webp|woff2)$/.test(name))return {__esModule:true,default:'preview-asset'};if(/(?:^|\/)posthog$/.test(name))return {__esModule:true,default:{capture(){}},isPostHogConfigured:false};if(/\/analytics$/.test(name))return new Proxy({__esModule:true},{get:(target,key)=>key in target?target[key]:()=>false});if(name.startsWith('.')){let p=path.resolve(path.dirname(abs),name);if(!fs.existsSync(p))p+=fs.existsSync(p+'.ts')?'.ts':'.tsx';return load(p);}return native(name);};
  new Function('require','module','exports','window','document','navigator',code)(require,module,module.exports,overrides.window??host,overrides.document??documentStub,overrides.navigator??{});return module.exports;
 }return load;}
const load=loader(),noop=()=>{},markup=[];
function render(name,file,props={}){const Component=load(file).default??load(file)[name];const html=renderToStaticMarkup(React.createElement(Component,props));assert.ok(html.length>50,name+' empty');markup.push({name,bytes:html.length});return html;}
render('GuidanceHome','src/features/guidance/GuidanceHome.tsx',{onStartMatch:noop,onRetakeMatch:noop,onExploreEngineering:noop,onOpenCounselor:noop,onOpenUniverse:noop});
render('EngineeringMatch','src/features/guidance/EngineeringMatch.tsx',{onBack:noop,onOpenCounselor:noop,onOpenUniverse:noop});
const missionQuestions=load('src/features/guidance/engineeringMatchData.ts').ENGINEERING_MATCH_QUESTIONS;
for(let questionIndex=0;questionIndex<missionQuestions.length;questionIndex++){
 load('src/lib/storage.ts').writeLocal('altwing-match-draft-v1',JSON.stringify({version:1,started:true,questionIndex,answers:{},result:null,beforeUnderstanding:null}));
 const html=render('Mission '+(questionIndex+1),'src/features/guidance/EngineeringMatch.tsx',{onBack:noop,onOpenCounselor:noop,onOpenUniverse:noop});
 const questionText=renderToStaticMarkup(React.createElement('span',null,missionQuestions[questionIndex].question)).replace(/^<span>|<\/span>$/g,'');assert.ok(html.includes(questionText),'Actual mission question missing: '+questionIndex);
}
load('src/lib/storage.ts').writeLocal('altwing-match-draft-v1','null');
render('EngineeringExplorer','src/features/guidance/EngineeringExplorer.tsx',{onBack:noop,onOpenCounselor:noop,onStartMatch:noop,onOpenAerospaceDeepDive:noop});
const majors=load('src/features/guidance/engineeringMajors.ts').ENGINEERING_MAJORS;
for(const major of majors)render('Field guide: '+major.id,'src/features/guidance/CounselorHub.tsx',{initialMajorId:major.id,initialTab:'PLAN',onNavigate:noop,onBack:noop,onExploreMajors:noop,onStartMatch:noop,onOpenUniverse:noop,onOpenAerospaceDeepDive:noop});
for(const tab of ['COLLEGES','OPPORTUNITIES','CAREERS','IDEAS'])render(tab,'src/features/guidance/CounselorHub.tsx',{initialMajorId:'mechanical',initialTab:tab,onNavigate:noop,onBack:noop,onExploreMajors:noop,onStartMatch:noop,onOpenUniverse:noop,onOpenAerospaceDeepDive:noop});
for(const id of ['','solar','bridge','cooling'])render('Project: '+(id||'catalog'),'src/features/projects/Projects.tsx',{projectId:id});
render('Aerospace Explorer','src/features/explore/ExploreAerospace.tsx',{onBack:noop,onTryWing:noop});
for(const [id,name]of [['propulsion','Propulsion'],['gnc','GNC'],['structures','Structures'],['thermal','Thermal'],['avionics','Avionics'],['mission-design','MissionDesign']]){
 render('Wing journey: '+id,'src/features/wingmatch/build/engine/BuildEngine.tsx',{wingId:id,onBack:noop});render(name+' Lab','src/features/wingmatch/build/labs/'+name+'Lab.tsx',{onEvidence:noop});
}
render('My Universe','src/features/progression/MyUniversePage.tsx',{onBack:noop,onStartMission:noop});
for(const kind of ['research','credits','terms'])render(kind,'src/components/InformationPage.tsx',{kind});
render('Privacy','src/components/PrivacyPage.tsx');render('Site Map','src/components/SiteMap.tsx');render('Progress Transfer','src/features/migration/ProgressTransfer.tsx');
for(const status of ['login','forbidden']){const h=render('Access: '+status,'src/features/analytics/AnalyticsAccessPanel.tsx',{status,preview:true});assert.ok(h.includes('disabled')&&!h.includes('alex.junhyuk'),'Preview must not reveal real administrator identities or perform login');}
render('404','app/not-found.tsx');render('PageLoading','src/components/SiteShell.tsx');
const schema=load('src/features/analytics/assessmentModel.ts'),Dialog=load('src/features/analytics/AssessmentDialog.tsx').default;
const dialogProps={onClose:noop,onSubmit:noop,phase:'questions',setPhase:noop,step:0,setStep:noop,answers:{},setAnswer:noop,story:'',setStory:noop,quote:false,setQuote:noop,saving:false,error:'',demo:true};
for(let step=0;step<5;step++){const html=renderToStaticMarkup(React.createElement(Dialog,{...dialogProps,step}));assert.ok(html.includes('role="dialog"')&&html.includes('aria-modal="true"')&&html.includes('aria-label="Close assessment'));assert.equal((html.match(/type="radio"/g)||[]).length,schema.ASSESSMENT_QUESTIONS[step].options.length);assert.ok(!/ checked(?:=|[ >])/.test(html),'Assessment response preselected');}
const answers=Object.fromEntries(schema.ASSESSMENT_QUESTIONS.map(q=>[q.id,q.options[0][0]])),blank=renderToStaticMarkup(React.createElement(Dialog,{...dialogProps,phase:'story',answers}));
assert.ok(blank.includes('Beyond the Flight.')&&!blank.includes('type="checkbox"')&&/<button type="submit"(?![^>]*disabled)/.test(blank),'All five answers can submit without a story/quotation');
const story=renderToStaticMarkup(React.createElement(Dialog,{...dialogProps,phase:'story',answers,story:'DEMO ONLY — optional story layout'}));assert.ok(story.includes('type="checkbox"')&&!/ checked(?:=|[ >])/.test(story));
const fixtures=load('preview/golden-horizon/researchFixtures.ts').demoReport('2026-11-12','2026-11-14','wingmatch','impact-v3');
const Report=load('src/features/analytics/ResearchImpactDashboard.tsx').ResearchReportView,reportHtml=renderToStaticMarkup(React.createElement(Report,{report:fixtures.report,demoStories:fixtures.stories}));assert.ok(reportHtml.includes('DEMO FIXTURES')&&reportHtml.includes('research-print-report')&&reportHtml.includes('Impact Stories library'));
const Legacy=load('src/features/analytics/ImpactDashboard.tsx').ImpactReportView,legacyHtml=renderToStaticMarkup(React.createElement(Legacy,{report:load('preview/golden-horizon/impactFixtures.ts').sample}));assert.ok(legacyHtml.includes('DEMO FIXTURES')&&legacyHtml.includes('Download'));
const footer=renderToStaticMarkup(React.createElement(load('src/components/SiteShell.tsx').SiteFooter));assert.ok(!footer.includes('/admin')&&!footer.includes('#/analytics'));
const scenes=load('preview/golden-horizon/scenes.ts').GOLDEN_SCENES;assert.equal(new Set(scenes.map(s=>s.id)).size,scenes.length);assert.equal(scenes.filter(s=>s.mission!==undefined).length,8);assert.equal(scenes.filter(s=>s.lab).length,6);assert.equal(scenes.filter(s=>s.id.startsWith('field-')).length,14);
const color=load('src/design/kickColorTokens.ts');const pairs=[['#F7F2E6','#101216',4.5],['#F7F2E6','#1B1E24',4.5],['#B7B5B0','#1B1E24',4.5],['#45D9FF','#1B1E24',4.5],['#101216','#45D9FF',4.5],['#101216','#E6BB65',4.5],['#45D9FF','#20343B',4.5],['#777C82','#1B1E24',3]];
const contrasts=pairs.map(([fg,bg,min])=>{const ratio=color.contrastRatio(fg,bg);assert.ok(ratio>=min,`${fg}/${bg}: ${ratio}`);return {fg,bg,ratio:Number(ratio.toFixed(2)),minimum:min};});
const motion=load('src/design/golden-horizon/motion.ts');assert.equal(motion.preferredScrollBehavior(),'smooth');host.matchMedia=()=>({matches:true});assert.equal(motion.preferredScrollBehavior(),'auto');
// Execute storage/network isolation against a fake host; never install it in Node globals.
const originalStorage=storage();originalStorage.setItem('real-progress','keep');let realFetchCalls=0;const isolatedHost={localStorage:originalStorage,sessionStorage:storage(),fetch:async()=>{realFetchCalls++;}},navigatorStub={sendBeacon(){return true;}};
loader({window:isolatedHost,navigator:navigatorStub})('preview/golden-horizon/isolation.ts');assert.equal(originalStorage.getItem('real-progress'),'keep');assert.equal(isolatedHost.localStorage.length,0);isolatedHost.localStorage.setItem('demo-progress','sample');assert.equal(originalStorage.getItem('demo-progress'),null);assert.equal((await isolatedHost.fetch('/api/impact/surveys',{method:'POST'})).status,503);assert.equal(realFetchCalls,0);assert.equal(navigatorStub.sendBeacon(),false);const mock=await(await isolatedHost.fetch('/api/impact/assessment-report')).json();assert.equal(mock.demo,true);
for(const f of ['.sites-runtime/golden-horizon-frame/index.html','.sites-runtime/golden-horizon-preview/index.html']){const html=read(f);assert.ok(!/<script\b[^>]*\bsrc=/.test(html)&&!/<link\b[^>]*rel="stylesheet"/.test(html));const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1],checked=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);assert.ok(html.includes('SIL OPEN FONT LICENSE'));}
for(const dir of ['pages-dist','pages-legacy','pages-preview'])if(fs.existsSync(dir)){
 for(const f of ['privacy','research','credits','terms'])assert.ok(read(dir+'/'+f+'.html').includes('--gh-ion:#45D9FF'),'Static page missing identity: '+dir+'/'+f);
 for(const file of fs.readdirSync(dir+'/assets').filter(f=>f.endsWith('.js'))){const js=read(dir+'/assets/'+file);assert.ok(!js.includes('DEMO-golden-horizon')&&!js.includes('altwing-golden:scene'),'Preview-only fixtures leaked into a production build');}
}
const output={checkedAtUTC:new Date().toISOString(),identity:'Golden Horizon / Ion Blue / approximately 5% target',uiStylesheetsMigrated:styleMap.files.length,protectedScientificRarityPrintRules:styleMap.protectedRules.length,preservedSemanticColorRules:styleMap.preservedSemanticColors.length,exactLogicDataApiFiles:exactLogicFiles,presentationOnlyUiAdapters:uiLogicFiles,previousColorLabFilesPreserved:previousFiles,actualComponentSnapshots:markup,sceneShortcuts:scenes.length,allEightScenarios:true,allFourteenFields:true,allSixLabsAndJourneys:true,assessmentNoPreselectionAndOptionalStory:'PASS',privateReportFixturesAndExports:'PASS — synthetic render only',privateAuthorization:'Unchanged sources; separately tested by release suite',previewStorageAndNetworkIsolation:'PASS — no real storage read/write or network transmission',sourceAndStandaloneSyntax:'PASS',contrasts,browserVisualQa:'UNVERIFIED — tool unavailable',screenReaderAndBrowserFocus:'UNVERIFIED',browserPdfOutput:'UNVERIFIED',accentPixelCoverage:'UNVERIFIED — approximate design target',productionChanged:false};
fs.mkdirSync('.sites-runtime/golden-horizon-check',{recursive:true});fs.writeFileSync('.sites-runtime/golden-horizon-check/results.json',JSON.stringify(output,null,2)+'\n');fs.writeFileSync('.sites-runtime/golden-horizon-check/LOGIC-PRESERVATION.json',JSON.stringify(currentModel,null,2)+'\n');
console.log(`PASS: Golden Horizon across ${styleMap.files.length} UI stylesheets; ${markup.length} actual component renders; ${scenes.length} preview scenes; ${exactLogicFiles} exact logic/data/API files; presentation-only adapters; science/rarity/status/print preservation, contrast, assessment and isolated preview. Browser, screen-reader and PDF review remain unverified.`);
