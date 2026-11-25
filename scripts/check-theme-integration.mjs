// Source/import and authored-cascade checks. This is NOT browser computed style.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
const read=p=>fs.readFileSync(p,'utf8'),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const entries=['src/main.tsx','app/layout.tsx','preview/black-gold/main.tsx','preview/golden-horizon/render.tsx','preview/impact/preview.tsx'];
function flatten(file,ancestors=[]){
  const root=postcss.parse(read(file),{from:file});
  root.walkAtRules('import',rule=>{
    const name=rule.params.match(/^['"]([^'"]+)['"]$/)?.[1];assert.ok(name,'Local stylesheet import expected');
    const target=path.resolve(path.dirname(file),name);assert.ok(!ancestors.includes(target),'CSS import cycle');
    rule.replaceWith(flatten(target,[...ancestors,path.resolve(file)]).nodes);
  });return root;
}
for(const entry of entries){
  const imports=[...read(entry).matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(m=>m[1]);
  const shared=imports.filter(p=>p.endsWith('/styles/application.css'));assert.equal(shared.length,1,entry+' needs the shared application stylesheet');
  const css=flatten(path.resolve(path.dirname(entry),shared[0])).toString();
  for(const token of ['--gh-obsidian:','--gh-pearl:','--gh-ion:'])assert.ok(css.includes(token),entry+' missing '+token);
  assert.ok(css.includes('.aw-gold-hero')&&css.includes('.assessment-dialog')&&css.includes('.research-panel'));
}
const base=process.argv[2];let baselineMismatch=null;
if(base){
  const oldEntry=read(path.join(base,'preview/black-gold/main.tsx'));
  const oldCss=[...oldEntry.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(m=>flatten(path.resolve(base,'preview/black-gold',m[1])).toString()).join('\n');
  baselineMismatch=!oldCss.includes('--gh-obsidian:');assert.equal(baselineMismatch,true,'Expected reproducible old preview import defect');
  for(const file of ['src/features/guidance/GuidanceHome.tsx','public/brand/altwing-penguin.png','src/assets/black-gold/orbital-horizon.webp'])assert.equal(hash(file),hash(path.join(base,file)),'Approved composition/asset changed: '+file);
}
function mediaMatches(rule,width){
  for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media'){
    if(/\bprint\b/.test(p.params)||/prefers-reduced-motion\s*:\s*reduce/.test(p.params))return false;
    const max=p.params.match(/max-width\s*:\s*(\d+)px/),min=p.params.match(/min-width\s*:\s*(\d+)px/);
    if(max&&width>Number(max[1])||min&&width<Number(min[1]))return false;
  }return true;
}
function modeledVariables(css,width,classes,isRoot=true,inherited=new Map()){
  const vars=new Map(inherited),priorities=new Map();let order=0;
  css.walkRules(rule=>{
    if(!mediaMatches(rule,width))return;
    for(const selector of rule.selector.split(',').map(s=>s.trim())){
      // Only simple theme-root scopes participate in this deliberately bounded
      // custom-property model; it does not simulate layout or the browser DOM.
      if(!/^(?::root)?(?:\.[\w-]+)*$/.test(selector)||!selector)continue;
      if(selector.includes(':root')&&!isRoot)continue;
      const needed=[...selector.matchAll(/\.([\w-]+)/g)].map(m=>m[1]);if(needed.some(c=>!classes.has(c)))continue;
      const specificity=needed.length+(selector.includes(':root')?1:0);
      rule.nodes.filter(n=>n.type==='decl'&&n.prop.startsWith('--')).forEach(d=>{
        const rank=[d.important?1:0,specificity,order++],old=priorities.get(d.prop);
        if(!old||rank[0]>old[0]||rank[0]===old[0]&&(rank[1]>old[1]||rank[1]===old[1]&&rank[2]>old[2])){vars.set(d.prop,d.value);priorities.set(d.prop,rank);}
      });
    }
  });return vars;
}
function resolve(vars,name,seen=[]){assert.ok(!seen.includes(name),'Variable cycle '+name);const value=vars.get(name);assert.notEqual(value,undefined,'Undefined variable '+name);return value.replace(/var\((--[\w-]+)\)/g,(_m,next)=>resolve(vars,next,[...seen,name]));}
const application=flatten('src/styles/application.css');
// Simulate both current and stale legacy sheets arriving after the shared CSS.
const late=application.clone();
for(const f of ['src/features/guidance/guidance.css','src/styles/experience.css'])late.append(postcss.parse(read(f)).nodes);
if(base)for(const f of ['src/features/guidance/guidance.css','src/styles/experience.css'])late.append(postcss.parse(read(path.join(base,f))).nodes);
const scopes=[];
for(const width of [320,390,768,1440]){
  const root=modeledVariables(late,width,new Set(['aw-theme-golden-horizon']));
  const wrapper=modeledVariables(late,width,new Set(['aw-theme-black-gold','aw-theme-golden-horizon']),false,root);
  for(const vars of [root,wrapper]){
    for(const [name,color]of [['--aw-bg','#101216'],['--aw-panel','#1b1e24'],['--aw-ink','#f7f2e6'],['--aw-mint','#45d9ff'],['--aw-gold','#e6bb65']])assert.equal(resolve(vars,name).toLowerCase(),color);
    assert.equal(resolve(vars,'--gh-header'),width<=960?'72px':'80px');
  }
  scopes.push({width,rootBackground:resolve(root,'--aw-bg'),rootForeground:resolve(root,'--aw-ink'),interaction:resolve(wrapper,'--aw-mint'),headerToken:resolve(root,'--gh-header')});
}
assert.ok(!/color:\s*var\(--gh-bg\)/.test(read('src/styles/global.css')));
assert.ok(read('src/styles/global.css').match(/\.nav-launch\s*\{[^}]*background:\s*var\(--gh-interactive\)/));
assert.ok(read('src/App.tsx').includes('data-aw-kick-level="3"'));
assert.ok(!read('app/site-client.tsx').includes('#0a1324'));
for(const f of ['index.html','preview/black-gold/index.html','preview/golden-horizon/index.html','preview/impact/index.html'])assert.ok(read(f).includes('class="aw-theme-golden-horizon"'),f);
const map=JSON.parse(read('docs/design/GOLDEN-HORIZON-STYLE-MAP.json'));
for(const item of map.protectedRules){let found=false;postcss.parse(read(item.file)).walkRules(r=>{if(r.selector===item.selector&&createHash('sha256').update(r.toString()).digest('hex')===item.sha256)found=true;});assert.ok(found,'Protected science/rarity/print rule: '+item.file+' '+item.selector);}
for(const item of map.preservedSemanticColors){const rules=[];postcss.parse(read(item.file)).walkRules(r=>rules.push(r));const rule=rules[item.ruleIndex];assert.equal(rule.selector,item.selector);for(const d of item.declarations)assert.ok(rule.nodes.some(n=>n.type==='decl'&&n.prop===d.property&&n.value===d.value&&!!n.important===d.important));}
const result={status:'PASS',scope:'Static imports, authored custom-property cascade model and protected-rule checks only',entrypointsChecked:entries.length,baselineMissingGoldenTokensReproduced:baselineMismatch,lateLegacyStylesTested:true,scopes,approvedCompositionAndAssetsUnchanged:!!base,protectedRules:map.protectedRules.length,semanticRules:map.preservedSemanticColors.length,browserComputedStyles:'UNVERIFIED',desktopMobileLayout:'UNVERIFIED',accentPixelCoverage:'UNVERIFIED — approximately 3% target',productionChanged:false};
fs.mkdirSync('.sites-runtime/visual-correction',{recursive:true});fs.writeFileSync('.sites-runtime/visual-correction/theme.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
