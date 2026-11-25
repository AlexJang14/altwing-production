import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {spawnSync} from 'node:child_process';
const native=createRequire(import.meta.url),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let savedMatch=null;
function loader(reactOverride){const cache=new Map();function load(file){const abs=path.resolve(file);if(cache.has(abs))return cache.get(abs).exports;const module={exports:{}};cache.set(abs,module);
 const js=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const require=name=>{if(name==='react'&&reactOverride)return reactOverride;if(name.endsWith('.css'))return {};if(/\.(webp|png|woff2)$/.test(name))return {__esModule:true,default:'preview-asset'};if(name==='./guidanceStorage')return {readEngineeringMatch:()=>savedMatch};if(name.startsWith('.')){const p=path.resolve(path.dirname(abs),name);return load(fs.existsSync(p)?p:fs.existsSync(p+'.ts')?p+'.ts':p+'.tsx');}return native(name);};
 new Function('require','module','exports',js)(require,module,module.exports);return module.exports;};return load;}
const load=loader(),Home=load('src/features/guidance/GuidanceHome.tsx').default;
const callbacks={onStartMatch(){},onRetakeMatch(){},onExploreEngineering(){},onOpenCounselor(){},onOpenUniverse(){}};
const markup=renderToStaticMarkup(createElement(Home,callbacks));
const plain=markup.replace(/<br\s*\/?\s*>/g,' ').replace(/<[^>]+>/g,'').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ');
assert.ok(plain.includes('Everyone has their own wings.')&&plain.includes("Talent is everywhere. Opportunity isn't."));
for(const route of ['#/match','#/explore','#/projects','#/colleges'])assert.ok(markup.includes(route));
for(const id of ['solar','cooling','bridge'])assert.ok(markup.includes('project='+id));
assert.ok(markup.includes('May 2025 snapshot')&&markup.includes('8 scenarios. No timer.')&&markup.includes('14'));
assert.ok(!/students served|trusted by|success rate|proven impact|million students/i.test(markup));
assert.equal((markup.match(/<h1\b/g)||[]).length,1);assert.ok(markup.includes('id="main-content"'));assert.ok(markup.includes('role="group"')&&markup.includes('aria-live="polite"'));
const chrome=load('src/components/SiteShell.tsx'),footer=renderToStaticMarkup(createElement(chrome.SiteFooter));assert.ok(!footer.includes('/admin')&&!footer.includes('#/analytics'));
function findAll(node,predicate){if(!node)return [];if(Array.isArray(node))return node.flatMap(c=>findAll(c,predicate));if(typeof node!=='object')return [];return [...(predicate(node)?[node]:[]),...findAll(node.props?.children,predicate)];}
let cursor=0;const slots=[],fakeReact={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],n=>{slots[i]=typeof n==='function'?n(slots[i]):n;}];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect(){}};
const interactive=loader(fakeReact),InteractiveHome=interactive('src/features/guidance/GuidanceHome.tsx').default;
const calls=[];const props={onStartMatch:()=>calls.push('start'),onRetakeMatch:()=>calls.push('retake'),onExploreEngineering:()=>calls.push('explore'),onOpenCounselor:(...v)=>calls.push(['guide',...v]),onOpenUniverse:()=>calls.push('universe')};
function renderHome(){cursor=0;return InteractiveHome(props);}
let tree=renderHome(),tabs=findAll(tree,n=>n.type==='button'&&typeof n.props['aria-pressed']==='boolean');assert.equal(tabs.length,3);assert.equal(tabs[0].props['aria-pressed'],true);tabs[1].props.onClick();tree=renderHome();assert.equal(findAll(tree,n=>n.type==='button'&&n.props['aria-pressed']===true).length,1);assert.ok(findAll(tree,n=>n.type==='a').some(n=>n.props.href==='#/projects?project=bridge'));
const buttons=findAll(tree,n=>n.type==='button');buttons.find(n=>findAll(n,child=>child.props?.className==='aw-gold-button').length===1&&n.props.className==='aw-gold-button').props.onClick();buttons.find(n=>n.props.onClick===props.onExploreEngineering).props.onClick();buttons.find(n=>n.props.onClick===props.onOpenUniverse).props.onClick();assert.deepEqual(calls.slice(0,3),['start','explore','universe']);
savedMatch={rankings:[{majorId:'mechanical'}]};tree=renderHome();const resume=findAll(tree,n=>n.type==='button'&&n.props.onClick===props.onRetakeMatch);assert.equal(resume.length,1);resume[0].props.onClick();const collegeButton=findAll(tree,n=>n.type==='button').find(n=>findAll(n,c=>c.type==='small'&&c.props.children==='UNIVERSITY DIRECTORY').length);collegeButton.props.onClick();assert.ok(calls.some(v=>Array.isArray(v)&&v[1]==='mechanical'&&v[2]==='COLLEGES'));
slots.length=0;const Header=interactive('src/components/SiteShell.tsx').SiteHeader;function renderHeader(){cursor=0;return Header({view:'home',tab:'PLAN'});}let h=renderHeader();let toggle=findAll(h,n=>n.type==='button')[0];let focus=0;toggle.props.ref.current={focus(){focus++;}};toggle.props.onClick();h=renderHeader();assert.equal(findAll(h,n=>n.type==='button')[0].props['aria-expanded'],true);findAll(h,n=>n.type==='nav')[0].props.onKeyDown({key:'Escape'});h=renderHeader();assert.equal(findAll(h,n=>n.type==='button')[0].props['aria-expanded'],false);assert.equal(focus,1);
const tokens=fs.readFileSync('src/design/blackGoldTokens.css','utf8'),colors=Object.fromEntries([...tokens.matchAll(/--(aw-color-[\w-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const [max,min]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (max+.05)/(min+.05);}
const pairs=[['aw-color-pearl','aw-color-obsidian',4.5],['aw-color-pearl','aw-color-graphite',4.5],['aw-color-muted','aw-color-obsidian',4.5],['aw-color-muted','aw-color-graphite',4.5],['aw-color-antique','aw-color-obsidian',4.5],['aw-color-antique','aw-color-graphite',4.5],['aw-color-dark-ink','aw-color-gold',4.5],['aw-color-champagne','aw-color-selected',4.5],['aw-color-control-line','aw-color-graphite',3],['aw-color-champagne','aw-color-graphite',3]];
const contrastResults=pairs.map(([fg,bg,target])=>{const ratio=contrast(colors[fg],colors[bg]);assert.ok(ratio>=target,fg+' on '+bg+' '+ratio);return {foreground:colors[fg],background:colors[bg],ratio:Number(ratio.toFixed(2)),minimum:target};});
const css=fs.readFileSync('src/design/blackGoldHome.css','utf8'),motion=fs.readFileSync('src/design/useVisualEntrance.ts','utf8');assert.ok(css.includes('prefers-reduced-motion:reduce')&&css.includes('animation:none!important')&&motion.includes('preference.matches')&&motion.includes('a.cancel()'));
assert.ok(css.includes('@media(max-width:680px)')&&css.includes('@media(max-width:359px)'));
const inner=fs.readFileSync('.sites-runtime/gold-homepage-preview/index.html','utf8'),outer=fs.readFileSync('.sites-runtime/gold-homepage-preview/preview.html','utf8');
assert.ok(!/<script\b[^>]*\bsrc=/.test(inner)&&!/<link\b[^>]*rel="stylesheet"/.test(inner));assert.equal((inner.match(/data:image\/png;base64,/g)||[]).length,1,'One cached mascot payload for the complete offline app');
assert.ok(inner.includes('SIL OPEN FONT LICENSE')&&inner.includes('Permission is hereby granted, free of charge'));assert.ok(outer.includes('srcdoc=')&&outer.includes('Mobile · 390')&&outer.includes('Other existing pages await visual approval.'));
const js=inner.match(/<script type="module">([\s\S]*?)<\/script>/)[1];fs.mkdirSync('.sites-runtime/gold-homepage-check',{recursive:true});fs.writeFileSync('.sites-runtime/gold-homepage-check/inline.mjs',js);const parsed=spawnSync(process.execPath,['--check','.sites-runtime/gold-homepage-check/inline.mjs'],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);
const base=JSON.parse(fs.readFileSync('.sites-runtime/design-baseline.json','utf8'));let preserved=0;for(const f of base.sourceFiles)if(/^(app\/api\/|lib\/|db\/|drizzle\/|worker\/|src\/features\/(analytics|progression|wingmatch|projects)\/)/.test(f.path)){assert.equal(sha(f.path),f.sha256,'Protected logic/data changed: '+f.path);preserved++;}
assert.equal(sha('public/brand/altwing-penguin.png'),'ba5278a01945231847b44295d56e0617bf8a7b922c5bd26c00e685fcab76b975');
for(const record of JSON.parse(fs.readFileSync('docs/design/BLACK-GOLD-FONT-LICENSES.json','utf8'))){assert.equal(sha(record.file),record.fontSha256);assert.ok(fs.readFileSync('public/THIRD_PARTY_NOTICES.txt','utf8').includes(fs.readFileSync(record.file.replace('-latin.woff2','-OFL.txt'),'utf8')));}
const result={checkedAtUTC:new Date().toISOString(),actualHomepageAndChromeRendered:true,actualProjectSelectorAndCallbacksVerified:true,savedResumeAndCollegeRoutingPreserved:true,mobileMenuEscapeFocusStateVerified:true,protectedSourceFilesPreserved:preserved,originalMascotUnchanged:true,offlinePreviewHasOneMascotPayload:true,contrastResults,contrastScope:'Computed token pairs, not browser-rendered contrast over images',reducedMotionCodeVerified:true,desktopMobileCssAndIframeControlsPresent:true,browserVisualQaPerformed:false,productionModified:false};fs.writeFileSync('.sites-runtime/gold-homepage-check/results.json',JSON.stringify(result,null,2)+'\n');console.log(`PASS: actual homepage/chrome, existing routes/callbacks/project selector/resume, menu Escape focus, ${preserved} protected source files unchanged, token contrast/motion, font notices and self-contained desktop/mobile preview. Browser layout/assistive-technology checks remain unverified.`);
