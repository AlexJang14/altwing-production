import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const cache=new Map();
function load(file){const abs=path.resolve(file);if(cache.has(abs))return cache.get(abs).exports;const module={exports:{}};cache.set(abs,module);const js=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',js)(name=>load(path.resolve(path.dirname(abs),name)+'.ts'),module,module.exports);return module.exports;}
const model=load('src/design/kickColorTokens.ts'),{KICK_PALETTES,KICK_CORE,kickSettings,kickContrast,contrastRatio}=model;
assert.deepEqual(KICK_PALETTES.map(p=>p.color),['#45D9FF','#FF695C','#C5F45D','#A995FF','#FF547D','#E6BB65']);
assert.deepEqual(KICK_CORE,{obsidian:'#101216',graphite:'#1B1E24',gold:'#E6BB65',pearl:'#F7F2E6'});
assert.equal(contrastRatio('#000000','#FFFFFF'),21);assert.equal(contrastRatio('#101216','#101216'),1);
const contrasts=[];
for(const palette of KICK_PALETTES){const ratios=kickContrast(palette.color);for(const key of ['accentOnObsidian','accentOnGraphite','obsidianOnAccent','pearlOnObsidian'])assert.ok(ratios[key]>=4.5,palette.id+' '+key);assert.ok(ratios.pearlOnAccent<4.5,'Do not use unreadable pearl CTA labels');
 for(const intensity of [2,3,4,5]){const settings=kickSettings(palette.id,intensity);assert.equal(settings.intensity,intensity);if(palette.id==='control')assert.deepEqual(settings.properties,{});else{assert.equal(settings.properties['--aw-kick-color'],palette.color);assert.ok(contrastRatio(palette.color,settings.properties['--aw-kick-selected-surface'])>=4.5,'Selected state needs normal-text contrast');}}
 contrasts.push({name:palette.name,hex:palette.color,...Object.fromEntries(Object.entries(ratios).map(([k,v])=>[k,Number(v.toFixed(4))]))});
}
assert.equal(kickSettings('unknown',100).palette.id,'control');assert.equal(kickSettings('ion-blue',100).intensity,5);assert.equal(kickSettings('ion-blue',-1).intensity,2);assert.equal(kickSettings('ion-blue',NaN).intensity,3);
class Style{values=new Map();setProperty(k,v){this.values.set(k,v);}removeProperty(k){this.values.delete(k);}getPropertyValue(k){return this.values.get(k)??'';}}
class Node{
 constructor(id=''){this.id=id;this.style=new Style();this.dataset={};this.listeners={};this.attributes={};this.classes=new Set();this.classList={toggle:(name,value)=>value?this.classes.add(name):this.classes.delete(name)};this.hidden=false;this.clientWidth=1440;this.value='';this.checked=false;this.innerHTML='';this.textContent='';this.srcdocWrites=0;this.sent=[];this.contentWindow={postMessage:m=>this.sent.push(m)};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}removeEventListener(type,fn){this.listeners[type]=(this.listeners[type]??[]).filter(v=>v!==fn);}dispatch(type,event={}){for(const fn of this.listeners[type]??[])fn(event);}setAttribute(k,v){this.attributes[k]=v;}set srcdoc(v){this.document=v;this.srcdocWrites++;}get srcdoc(){return this.document;}
}
class Observer{constructor(fn){this.fn=fn;this.targets=[];}observe(target){this.targets.push(target);}disconnect(){this.targets=[];}fire(){this.fn();}}
function fakeHost(){const host=new Node();host.ResizeObserver=Observer;host.MutationObserver=Observer;host.parent={sent:[],postMessage(m){this.sent.push(m);}};host.time=0;host.performance={now:()=>host.time};host.scrollY=420;host.scrollTo=v=>{host.lastScroll=v;host.scrollY=v.top;};let next=0;const raf=new Map();host.requestAnimationFrame=fn=>{raf.set(++next,fn);return next;};host.cancelAnimationFrame=id=>raf.delete(id);host.flush=()=>{for(const [id,fn]of [...raf]){raf.delete(id);fn();}};return host;}
const controller=load('preview/color-lab/lab/controller.ts');
const ids=['frame-a','frame-b','intensity','comparison-palette','palettes','selection-name','selection-note','selection-hex','intensity-output','intensity-note','comparison-controls','frame-b-card','canvases','desktop','mobile','single','compare','frame-a-name','frame-b-name','frame-a-hex','frame-b-hex','frame-a-dot','frame-b-dot','frame-a-size','frame-b-size','contrast-obsidian','contrast-graphite','ratio-obsidian','ratio-graphite','contrast-cta','ratio-cta','ratio-pearl','avoid-pearl','status','home','surface-a','surface-b','stage-a','stage-b','contrast-table-body'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Node(id)])),radios=KICK_PALETTES.map(p=>Object.assign(new Node(),{value:p.id}));
const doc={body:new Node(),getElementById:id=>nodes[id],querySelectorAll:()=>radios};const host=fakeHost(),documentMarker='UNMODIFIED ACTUAL HOMEPAGE DOCUMENT';
const cleanup=controller.mountColorLab(doc,host,documentMarker);
assert.equal(nodes['frame-a'].srcdoc,documentMarker);assert.equal(nodes['frame-a'].srcdocWrites,1);assert.equal(nodes['frame-b'].srcdocWrites,0,'Second app is lazy-loaded');assert.ok(nodes['frame-b-card'].hidden);assert.equal(nodes['frame-a'].style.width,'1440px');
for(const p of KICK_PALETTES){radios.forEach(r=>{r.checked=r.value===p.id;});radios.find(r=>r.value===p.id).dispatch('change');assert.equal(nodes['selection-name'].textContent,p.name);assert.equal(doc.body.style.getPropertyValue('--lab-active'),p.color);assert.equal(nodes['frame-a'].sent.at(-1).palette,p.id);assert.equal(nodes['frame-a'].srcdocWrites,1,'Palette changes must not remount the app');}
nodes.intensity.value='5';nodes.intensity.dispatch('input');assert.equal(nodes['frame-a'].sent.at(-1).intensity,5);assert.equal(nodes['intensity-output'].textContent,'5 / Expressive');
nodes.compare.dispatch('click');assert.equal(nodes['frame-b'].srcdocWrites,1);assert.equal(nodes['frame-b'].srcdoc,documentMarker);assert.ok(!nodes['frame-b-card'].hidden);assert.ok(nodes.canvases.classes.has('is-comparing'));
nodes['comparison-palette'].value='solar-coral';nodes['comparison-palette'].dispatch('change');assert.equal(nodes['frame-b'].sent.at(-1).palette,'solar-coral');
nodes.mobile.dispatch('click');assert.equal(nodes['frame-a'].style.width,'390px');assert.equal(nodes['frame-b'].style.width,'390px');assert.equal(nodes['frame-a-size'].textContent,'390 × 844');assert.equal(nodes['frame-a'].srcdocWrites,1);
nodes['surface-a'].clientWidth=720;nodes.desktop.dispatch('click');assert.equal(nodes['frame-a'].style.width,'1440px');assert.equal(nodes['frame-a'].style.transform,'scale(0.5)','Comparison must preserve the desktop media-query viewport');
host.dispatch('message',{source:nodes['frame-a'].contentWindow,data:{kind:'altwing-color-lab:scroll',y:256}});assert.deepEqual(nodes['frame-b'].sent.at(-1),{kind:'altwing-color-lab:scroll-to',y:256});
const before=nodes['frame-b'].sent.length;host.dispatch('message',{source:{},data:{kind:'altwing-color-lab:scroll',y:100}});assert.equal(nodes['frame-b'].sent.length,before,'Unknown windows cannot send bridge commands');
nodes.home.dispatch('click');assert.equal(nodes['frame-a'].sent.at(-1).kind,'altwing-preview-home');assert.equal(nodes['frame-b'].sent.at(-1).kind,'altwing-preview-home');
nodes.single.dispatch('click');nodes.compare.dispatch('click');assert.equal(nodes['frame-b'].srcdocWrites,1,'Reopening comparison preserves the existing app');
assert.ok(nodes['contrast-table-body'].innerHTML.includes('Cosmic Raspberry'));assert.ok(nodes['avoid-pearl'].innerHTML.includes('fails'));cleanup();
const {installColorLabBridge}=load('preview/color-lab/frameBridge.ts'),frameHost=fakeHost(),theme=new Node();frameHost.document={body:new Node(),querySelector:()=>theme};const cleanupFrame=installColorLabBridge(frameHost);
assert.equal(theme.dataset.awKick,'ion-blue');
frameHost.dispatch('message',{source:{},data:{kind:'altwing-color-lab:theme',palette:'hyper-lime',intensity:5}});assert.equal(theme.dataset.awKick,'ion-blue');
for(const p of KICK_PALETTES){frameHost.dispatch('message',{source:frameHost.parent,data:{kind:'altwing-color-lab:theme',palette:p.id,intensity:4}});assert.equal(theme.dataset.awKick,p.id);if(p.id==='control')assert.equal(theme.style.values.size,0,'Control removes every kick override');else assert.equal(theme.style.getPropertyValue('--aw-kick-color'),p.color);}
frameHost.dispatch('message',{source:frameHost.parent,data:{kind:'altwing-color-lab:scroll-to',y:256}});assert.equal(frameHost.lastScroll.top,256);const beforeScroll=frameHost.parent.sent.length;frameHost.dispatch('scroll');frameHost.flush();assert.equal(frameHost.parent.sent.length,beforeScroll,'Linked scroll must not bounce back');frameHost.time=200;frameHost.dispatch('scroll');frameHost.flush();assert.equal(frameHost.parent.sent.at(-1).kind,'altwing-color-lab:scroll');cleanupFrame();
const baseline=JSON.parse(fs.readFileSync('.sites-runtime/color-lab-baseline.json','utf8'));let unchanged=0;
const previousWorkspaceAvailable=fs.existsSync(baseline.sourceWorkspace);
for(const row of baseline.sourceFiles){if(previousWorkspaceAvailable)assert.equal(sha(path.join(baseline.sourceWorkspace,row.path)),row.sha256,'Previous homepage workspace was altered');if(row.path==='package.json')continue;assert.equal(sha(row.path),row.sha256,'Existing implementation changed: '+row.path);unchanged++;}
const original=JSON.parse(fs.readFileSync('.sites-runtime/design-baseline.json','utf8')),originalWorkspaceAvailable=fs.existsSync(original.sourceWorkspace);if(originalWorkspaceAvailable)for(const row of original.sourceFiles)assert.equal(sha(path.join(original.sourceWorkspace,row.path)),row.sha256,'Original release candidate was altered');
const html=fs.readFileSync('.sites-runtime/color-lab/index.html','utf8'),frame=fs.readFileSync('.sites-runtime/color-lab-frame/index.html','utf8');
assert.ok(!/<script\b[^>]*\bsrc=/.test(html)&&!/<link\b[^>]*rel="stylesheet"/.test(html),'Color Lab is a single offline file');
assert.equal((html.match(/data:image\/png;base64,/g)||[]).length,1,'Share one actual application/mascot payload across the two frames');
for(const word of ['Choose the spark.','Side by side','Target presence','Contrast at a glance.','Production unchanged'])assert.ok(html.includes(word));
assert.ok(frame.includes('altwing-color-lab:theme')&&frame.includes('altwing-color-lab:ready')&&frame.includes('SIL OPEN FONT LICENSE'));
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];const parsed=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);
const roles=fs.readFileSync('src/design/kickColorRoles.css','utf8');assert.ok(!/filter:|linear-gradient|radial-gradient/.test(roles));assert.ok(!/\.aw-gold-(?:horizon|guide|home h1)/.test(roles),'Do not recolor imagery, mascot or headings');
const css=fs.readFileSync('preview/color-lab/lab/style.css','utf8');assert.ok(css.includes('prefers-reduced-motion:reduce')&&css.includes('[hidden]'));
const result={checkedAtUTC:new Date().toISOString(),paletteCount:6,intensityLevels:[2,3,4,5],exactRequestedColors:true,normalTextContrastAllTestedPairsPass:true,selectedStateContrastAllLevelsPass:true,pearlOnAccentFailsAndIsAvoided:true,controllerInteractionHarness:'PASS — six choices, intensity, comparison, viewport, lazy frame reuse, linked scroll, return home and sender validation',frameBridgeHarness:'PASS — theme application, control reset, sender validation and no scroll bounce',existingHomepageCandidateFilesUnchanged:unchanged,originalHomepageWorkspaceFilesPreserved:previousWorkspaceAvailable?baseline.sourceFiles.length:'UNVERIFIED — original workspace unavailable',originalReleaseCandidateFilesPreserved:originalWorkspaceAvailable?original.sourceFiles.length:'UNVERIFIED — original workspace unavailable',oneSharedHomepageDocument:true,standaloneScriptSyntax:'PASS',browserVisualQaPerformed:false,measuredPixelCoverage:false,productionChanged:false,contrasts};
fs.mkdirSync('.sites-runtime/color-lab-check',{recursive:true});fs.writeFileSync('.sites-runtime/color-lab-check/results.json',JSON.stringify(result,null,2)+'\n');
console.log(`PASS: six exact palettes × four intensities, contrast, actual Color Lab/bridge controllers, preserved app instances, responsive viewport scaling, ${unchanged} existing source files. Prior-workspace checks: ${previousWorkspaceAvailable&&originalWorkspaceAvailable?'PASS':'UNVERIFIED where unavailable'}. Browser layout/assistive-technology and pixel coverage remain unverified.`);
